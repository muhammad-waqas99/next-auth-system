import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

export function getDeviceInfo(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";

  const parser = new UAParser(userAgent);

  const browser = parser.getBrowser().name || "Unknown";
  const os = parser.getOS().name || "Unknown";

  const deviceInfo = parser.getDevice();
  const device = deviceInfo.type || "Desktop";

  return {
    browser,
    os,
    device,
  };
}