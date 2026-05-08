import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingRoot: require("path").join(__dirname, "../"),

    allowedDevOrigins: ["192.168.0.22", "192.168.1.94"],
};

export default nextConfig;
