#!/usr/bin/env swift
import AppKit

struct Rect: Decodable {
  let x: CGFloat
  let y: CGFloat
  let width: CGFloat
  let height: CGFloat
}

guard CommandLine.arguments.count == 4 else {
  fputs("Usage: redact-image.swift <input> <output> <rectangles-json>\n", stderr)
  exit(64)
}

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let rectangles = try JSONDecoder().decode(
  [Rect].self,
  from: Data(CommandLine.arguments[3].utf8)
)

guard let image = NSImage(contentsOf: input) else {
  fputs("Could not read image: \(input.path)\n", stderr)
  exit(66)
}

let pixels = image.size
guard let bitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: Int(pixels.width),
  pixelsHigh: Int(pixels.height),
  bitsPerSample: 8,
  samplesPerPixel: 4,
  hasAlpha: true,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
) else {
  fputs("Could not create bitmap.\n", stderr)
  exit(70)
}

NSGraphicsContext.saveGraphicsState()
defer { NSGraphicsContext.restoreGraphicsState() }
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
image.draw(in: NSRect(origin: .zero, size: pixels))
NSColor(calibratedRed: 0.81, green: 0.84, blue: 0.89, alpha: 1).setFill()
for rect in rectangles {
  NSBezierPath(rect: NSRect(x: rect.x, y: pixels.height - rect.y - rect.height, width: rect.width, height: rect.height)).fill()
}

guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.92]) else {
  fputs("Could not encode JPEG.\n", stderr)
  exit(70)
}
try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
try data.write(to: output)
