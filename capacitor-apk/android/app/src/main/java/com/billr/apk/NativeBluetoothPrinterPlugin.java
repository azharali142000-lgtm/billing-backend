package com.billr.apk;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "NativeBluetoothPrinter",
    permissions = {
        @Permission(alias = "bluetooth", strings = { Manifest.permission.BLUETOOTH_CONNECT })
    }
)
public class NativeBluetoothPrinterPlugin extends Plugin {
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    private BluetoothSocket activeSocket;
    private OutputStream activeOutputStream;
    private String connectedAddress;
    private String connectedName;

    @PluginMethod
    public void getStatus(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        JSObject result = new JSObject();
        result.put("available", adapter != null);
        result.put("platform", "android");
        result.put("enabled", adapter != null && adapter.isEnabled());
        result.put("connected", isConnected());
        result.put("savedPrinter", buildSavedPrinter());
        call.resolve(result);
    }

    @PluginMethod
    public void listPairedDevices(PluginCall call) {
        if (!ensureBluetoothPermission(call, "listPairedDevicesAfterPermission")) {
            return;
        }
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }
        if (!adapter.isEnabled()) {
            call.reject("Turn on Bluetooth on your phone, then try again.");
            return;
        }

        JSArray devices = new JSArray();
        try {
            Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();
            if (bondedDevices != null) {
                for (BluetoothDevice device : bondedDevices) {
                    JSObject entry = new JSObject();
                    entry.put("name", device.getName());
                    entry.put("address", device.getAddress());
                    devices.put(entry);
                }
            }
            JSObject result = new JSObject();
            result.put("devices", devices);
            call.resolve(result);
        } catch (SecurityException error) {
            call.reject("Bluetooth permission is required to list paired devices.", error);
        }
    }

    @PermissionCallback
    private void listPairedDevicesAfterPermission(PluginCall call) {
        if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
            call.reject("Bluetooth permission was denied.");
            return;
        }
        listPairedDevices(call);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (!ensureBluetoothPermission(call, "connectAfterPermission")) {
            return;
        }
        String address = call.getString("address");
        if (address == null || address.trim().isEmpty()) {
            call.reject("Printer address is required.");
            return;
        }
        getBridge().execute(() -> {
            try {
                BluetoothDevice device = requireBondedDevice(address);
                connectToDevice(device);
                call.resolve(buildConnectionResult());
            } catch (Exception error) {
                call.reject(error.getMessage(), error);
            }
        });
    }

    @PermissionCallback
    private void connectAfterPermission(PluginCall call) {
        if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
            call.reject("Bluetooth permission was denied.");
            return;
        }
        connect(call);
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        closeConnection();
        JSObject result = new JSObject();
        result.put("connected", false);
        call.resolve(result);
    }

    @PluginMethod
    public void printEscPos(PluginCall call) {
        if (!ensureBluetoothPermission(call, "printEscPosAfterPermission")) {
            return;
        }
        String address = call.getString("address");
        String payloadBase64 = call.getString("payloadBase64");
        if (address == null || address.trim().isEmpty()) {
            call.reject("Printer address is required.");
            return;
        }
        if (payloadBase64 == null || payloadBase64.isEmpty()) {
            call.reject("Print payload is required.");
            return;
        }

        getBridge().execute(() -> {
            try {
                BluetoothDevice device = requireBondedDevice(address);
                if (!isConnectedTo(address)) {
                    connectToDevice(device);
                }

                byte[] payload = Base64.decode(payloadBase64, Base64.DEFAULT);
                if (activeOutputStream == null) {
                    throw new IOException("Printer output stream is not available.");
                }
                activeOutputStream.write(payload);
                activeOutputStream.flush();
                call.resolve(buildConnectionResult());
            } catch (Exception error) {
                call.reject(error.getMessage(), error);
            }
        });
    }

    @PermissionCallback
    private void printEscPosAfterPermission(PluginCall call) {
        if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
            call.reject("Bluetooth permission was denied.");
            return;
        }
        printEscPos(call);
    }

    private boolean ensureBluetoothPermission(PluginCall call, String callbackName) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return true;
        }
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            return true;
        }
        requestPermissionForAlias("bluetooth", call, callbackName);
        return false;
    }

    private BluetoothDevice requireBondedDevice(String address) throws IOException {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            throw new IOException("Bluetooth is not available on this device.");
        }
        if (!adapter.isEnabled()) {
            throw new IOException("Turn on Bluetooth on your phone, then try again.");
        }

        Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();
        if (bondedDevices != null) {
            for (BluetoothDevice device : bondedDevices) {
                if (address.equalsIgnoreCase(device.getAddress())) {
                    return device;
                }
            }
        }
        throw new IOException("Selected printer is not paired with this phone.");
    }

    private synchronized void connectToDevice(BluetoothDevice device) throws IOException {
        closeConnection();
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter != null && adapter.isDiscovering()) {
            adapter.cancelDiscovery();
        }

        BluetoothSocket socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
        socket.connect();

        activeSocket = socket;
        activeOutputStream = socket.getOutputStream();
        connectedAddress = device.getAddress();
        connectedName = device.getName();
    }

    private synchronized void closeConnection() {
        if (activeOutputStream != null) {
            try {
                activeOutputStream.close();
            } catch (IOException ignored) {
            }
        }
        if (activeSocket != null) {
            try {
                activeSocket.close();
            } catch (IOException ignored) {
            }
        }
        activeOutputStream = null;
        activeSocket = null;
        connectedAddress = null;
        connectedName = null;
    }

    private synchronized boolean isConnected() {
        return activeSocket != null && activeSocket.isConnected() && activeOutputStream != null;
    }

    private synchronized boolean isConnectedTo(String address) {
        return isConnected() && connectedAddress != null && connectedAddress.equalsIgnoreCase(address);
    }

    private synchronized JSObject buildSavedPrinter() {
        if (!isConnected() || connectedAddress == null) {
            return null;
        }
        JSObject printer = new JSObject();
        printer.put("address", connectedAddress);
        printer.put("name", connectedName);
        return printer;
    }

    private synchronized JSObject buildConnectionResult() {
        JSObject result = new JSObject();
        result.put("connected", isConnected());
        result.put("savedPrinter", buildSavedPrinter());
        return result;
    }
}
