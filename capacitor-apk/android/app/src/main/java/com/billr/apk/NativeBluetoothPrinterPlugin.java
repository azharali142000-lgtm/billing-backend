package com.billr.apk;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "NativeBluetoothPrinter",
    permissions = {
      @Permission(
          alias = "bluetooth",
          strings = {Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN})
    })
public class NativeBluetoothPrinterPlugin extends Plugin {
  private static final String PREFS_NAME = "billr_printer";
  private static final String PREF_PRINTER_ADDRESS = "printer_address";
  private static final String PREF_PRINTER_NAME = "printer_name";
  private static final UUID SERIAL_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

  private SharedPreferences preferences;
  private BluetoothAdapter bluetoothAdapter;
  private BluetoothSocket activeSocket;
  private BluetoothDevice activeDevice;
  private String pendingAction;

  @Override
  public void load() {
    preferences = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
  }

  @PluginMethod
  public void getStatus(PluginCall call) {
    if (!ensureBluetoothPermission(call, "getStatus")) {
      return;
    }
    call.resolve(buildStatus());
  }

  @PluginMethod
  public void listPairedDevices(PluginCall call) {
    if (!ensureBluetoothPermission(call, "listPairedDevices")) {
      return;
    }

    try {
      ensureBluetoothReady();
      JSObject result = new JSObject();
      result.put("devices", buildPairedDevicesArray());
      call.resolve(result);
    } catch (Exception error) {
      call.reject(error.getMessage());
    }
  }

  @PluginMethod
  public void savePrinter(PluginCall call) {
    if (!ensureBluetoothPermission(call, "savePrinter")) {
      return;
    }

    String address = call.getString("address");
    String name = call.getString("name");
    if (address == null || address.trim().isEmpty()) {
      call.reject("Printer address is required");
      return;
    }

    try {
      ensureBluetoothReady();
      BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
      preferences.edit()
          .putString(PREF_PRINTER_ADDRESS, device.getAddress())
          .putString(PREF_PRINTER_NAME, name != null && !name.trim().isEmpty() ? name : safeDeviceName(device))
          .apply();
      connectToPrinter(device.getAddress());
      call.resolve(buildStatus());
    } catch (Exception error) {
      call.reject(error.getMessage());
    }
  }

  @PluginMethod
  public void clearSavedPrinter(PluginCall call) {
    disconnectActiveSocket();
    preferences.edit().remove(PREF_PRINTER_ADDRESS).remove(PREF_PRINTER_NAME).apply();
    call.resolve(buildStatus());
  }

  @PluginMethod
  public void reconnectSavedPrinter(PluginCall call) {
    if (!ensureBluetoothPermission(call, "reconnectSavedPrinter")) {
      return;
    }

    try {
      String address = preferences.getString(PREF_PRINTER_ADDRESS, null);
      if (address != null && !address.trim().isEmpty()) {
        connectToPrinter(address);
      }
      call.resolve(buildStatus());
    } catch (Exception error) {
      call.reject(error.getMessage());
    }
  }

  @PluginMethod
  public void printEscPos(PluginCall call) {
    if (!ensureBluetoothPermission(call, "printEscPos")) {
      return;
    }

    String payloadBase64 = call.getString("payloadBase64");
    String address = call.getString("address", preferences.getString(PREF_PRINTER_ADDRESS, null));

    if (payloadBase64 == null || payloadBase64.trim().isEmpty()) {
      call.reject("Print payload is required");
      return;
    }

    if (address == null || address.trim().isEmpty()) {
      call.reject("No printer selected. Choose a paired printer in Settings first.");
      return;
    }

    try {
      byte[] payload = Base64.decode(payloadBase64, Base64.DEFAULT);
      BluetoothSocket socket = connectToPrinter(address);
      OutputStream outputStream = socket.getOutputStream();
      outputStream.write(payload);
      outputStream.flush();
      call.resolve(buildStatus());
    } catch (Exception error) {
      disconnectActiveSocket();
      call.reject(error.getMessage());
    }
  }

  @PermissionCallback
  private void bluetoothPermissionCallback(PluginCall call) {
    if (!hasRequiredPermissions()) {
      pendingAction = null;
      call.reject("Bluetooth permission denied");
      return;
    }

    String action = pendingAction;
    pendingAction = null;
    if ("getStatus".equals(action)) {
      getStatus(call);
    } else if ("listPairedDevices".equals(action)) {
      listPairedDevices(call);
    } else if ("savePrinter".equals(action)) {
      savePrinter(call);
    } else if ("reconnectSavedPrinter".equals(action)) {
      reconnectSavedPrinter(call);
    } else if ("printEscPos".equals(action)) {
      printEscPos(call);
    } else {
      call.resolve(buildStatus());
    }
  }

  private boolean ensureBluetoothPermission(PluginCall call, String action) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || hasRequiredPermissions()) {
      return true;
    }
    pendingAction = action;
    requestAllPermissions(call, "bluetoothPermissionCallback");
    return false;
  }

  private void ensureBluetoothReady() {
    if (bluetoothAdapter == null) {
      throw new IllegalStateException("Bluetooth is not supported on this device");
    }
    if (!bluetoothAdapter.isEnabled()) {
      throw new IllegalStateException("Bluetooth is turned off");
    }
  }

  private synchronized BluetoothSocket connectToPrinter(String address) throws IOException {
    ensureBluetoothReady();

    if (activeSocket != null
        && activeSocket.isConnected()
        && activeDevice != null
        && address.equalsIgnoreCase(activeDevice.getAddress())) {
      return activeSocket;
    }

    disconnectActiveSocket();

    BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
    IOException lastError = null;
    BluetoothSocket socket = null;

    try {
      bluetoothAdapter.cancelDiscovery();
      socket = device.createRfcommSocketToServiceRecord(SERIAL_UUID);
      socket.connect();
    } catch (IOException firstError) {
      lastError = firstError;
      closeQuietly(socket);
      socket = device.createInsecureRfcommSocketToServiceRecord(SERIAL_UUID);
      socket.connect();
    }

    activeSocket = socket;
    activeDevice = device;
    preferences.edit()
        .putString(PREF_PRINTER_ADDRESS, device.getAddress())
        .putString(PREF_PRINTER_NAME, preferences.getString(PREF_PRINTER_NAME, safeDeviceName(device)))
        .apply();

    if (lastError != null) {
      // Connection succeeded on fallback socket.
    }
    return activeSocket;
  }

  private synchronized void disconnectActiveSocket() {
    closeQuietly(activeSocket);
    activeSocket = null;
    activeDevice = null;
  }

  private void closeQuietly(BluetoothSocket socket) {
    if (socket == null) {
      return;
    }
    try {
      socket.close();
    } catch (IOException ignored) {
    }
  }

  private JSObject buildStatus() {
    JSObject status = new JSObject();
    status.put("available", bluetoothAdapter != null);
    status.put("platform", "android");
    status.put("connected", activeSocket != null && activeSocket.isConnected());
    status.put("savedPrinter", buildSavedPrinter());
    return status;
  }

  private JSObject buildSavedPrinter() {
    String address = preferences.getString(PREF_PRINTER_ADDRESS, null);
    if (address == null || address.trim().isEmpty()) {
      return null;
    }

    JSObject printer = new JSObject();
    printer.put("address", address);
    printer.put("name", preferences.getString(PREF_PRINTER_NAME, "Thermal Printer"));
    return printer;
  }

  private JSArray buildPairedDevicesArray() {
    JSArray devicesArray = new JSArray();
    if (bluetoothAdapter == null) {
      return devicesArray;
    }

    Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();
    List<BluetoothDevice> devices = new ArrayList<>(bondedDevices);
    Collections.sort(
        devices,
        Comparator.comparing(
            device -> (safeDeviceName(device) + device.getAddress()).toLowerCase()));

    for (BluetoothDevice device : devices) {
      JSObject payload = new JSObject();
      payload.put("name", safeDeviceName(device));
      payload.put("address", device.getAddress());
      devicesArray.put(payload);
    }
    return devicesArray;
  }

  private String safeDeviceName(BluetoothDevice device) {
    String name = device.getName();
    return name != null && !name.trim().isEmpty() ? name : "Bluetooth Printer";
  }
}
