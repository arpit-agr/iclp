class CrossPainter {
  static get inputProperties() {
      return ["--border-thin", "--primary-text-color"]
  }
  paint(t, e, r) {
      t.lineWidth = r.get("--border-thin").value, t.strokeStyle = r.get("--color-dark").toString(), t.beginPath(), t.moveTo(0, 0), t.lineTo(e.width, e.height), t.stroke(), t.beginPath(), t.moveTo(e.width, 0), t.lineTo(0, e.height), t.stroke()
  }
}
registerPaint("image-cross", CrossPainter);