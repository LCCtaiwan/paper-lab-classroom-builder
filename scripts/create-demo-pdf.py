#!/usr/bin/env python3
"""Create the redistributable Paper Lab synthetic demo handout."""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "examples" / "paper-lab-demo.pdf"
WIDTH = 13.333 * inch
HEIGHT = 7.5 * inch

NAVY = HexColor("#102A43")
BLUE = HexColor("#1677A8")
PALE = HexColor("#EAF5FA")
AMBER = HexColor("#D97706")
MINT = HexColor("#DDF4EC")
MUTED = HexColor("#627D98")
WHITE = HexColor("#FFFFFF")
LINE = HexColor("#C9DCE9")


def footer(pdf: canvas.Canvas, page: int) -> None:
    pdf.setStrokeColor(LINE)
    pdf.line(0.65 * inch, 0.52 * inch, WIDTH - 0.65 * inch, 0.52 * inch)
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 8)
    pdf.drawString(0.65 * inch, 0.32 * inch, "Synthetic demo content - safe to redistribute")
    pdf.drawRightString(WIDTH - 0.65 * inch, 0.32 * inch, f"PAPER LAB  /  {page}")


def eyebrow(pdf: canvas.Canvas, text: str) -> None:
    pdf.setFillColor(BLUE)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(0.72 * inch, HEIGHT - 0.72 * inch, text.upper())


def title(pdf: canvas.Canvas, lines: list[str], top: float = 1.45) -> None:
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 31)
    y = HEIGHT - top * inch
    for line in lines:
        pdf.drawString(0.72 * inch, y, line)
        y -= 0.46 * inch


def page_one(pdf: canvas.Canvas) -> None:
    eyebrow(pdf, "Paper Lab synthetic handout")
    title(pdf, ["Turn slides into", "shared questions."])
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 13)
    pdf.drawString(0.75 * inch, 4.48 * inch, "A three-page course for testing the complete classroom workflow.")

    cards = [
        ("1", "Present", "Keep the original PDF in order."),
        ("2", "Ask", "Students question the current page."),
        ("3", "Discuss", "The teacher chooses what to project."),
    ]
    x = 0.75 * inch
    for number, heading, body in cards:
        pdf.setFillColor(PALE)
        pdf.roundRect(x, 1.25 * inch, 3.78 * inch, 2.55 * inch, 16, fill=1, stroke=0)
        pdf.setFillColor(BLUE)
        pdf.circle(x + 0.43 * inch, 3.33 * inch, 0.22 * inch, fill=1, stroke=0)
        pdf.setFillColor(WHITE)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawCentredString(x + 0.43 * inch, 3.27 * inch, number)
        pdf.setFillColor(NAVY)
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(x + 0.3 * inch, 2.78 * inch, heading)
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 10.5)
        pdf.drawString(x + 0.3 * inch, 2.27 * inch, body)
        x += 4.05 * inch
    footer(pdf, 1)


def page_two(pdf: canvas.Canvas) -> None:
    eyebrow(pdf, "Section 1 - Shared questions")
    title(pdf, ["Notice the moment", "confusion begins."])
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 12.5)
    pdf.drawString(0.75 * inch, 4.45 * inch, "Every question is linked to the teacher's current page and section.")

    steps = [
        ("A", "Student asks", "Use a nickname. Never enter private or patient data."),
        ("B", "Peers vote", "One reaction per student keeps shared confusion visible."),
        ("C", "Teacher decides", "Questions stay off the projector until selected."),
    ]
    y = 3.63 * inch
    for letter, heading, body in steps:
        pdf.setFillColor(MINT if letter != "B" else PALE)
        pdf.roundRect(0.78 * inch, y - 0.7 * inch, 11.78 * inch, 0.9 * inch, 12, fill=1, stroke=0)
        pdf.setFillColor(NAVY)
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(1.08 * inch, y - 0.25 * inch, f"{letter}  {heading}")
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(4.05 * inch, y - 0.25 * inch, body)
        y -= 1.05 * inch
    footer(pdf, 2)


def page_three(pdf: canvas.Canvas) -> None:
    eyebrow(pdf, "Section 2 - Teacher checkpoint")
    title(pdf, ["Pause. Choose one.", "Continue together."])
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 12.5)
    pdf.drawString(0.75 * inch, 4.45 * inch, "A checkpoint is a teacher decision, never an automatic Agent action.")

    pdf.setFillColor(NAVY)
    pdf.roundRect(0.78 * inch, 1.2 * inch, 7.3 * inch, 2.55 * inch, 18, fill=1, stroke=0)
    pdf.setFillColor(WHITE)
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(1.15 * inch, 3.18 * inch, "Teacher checklist")
    checklist = [
        "Review the most-voted questions.",
        "Project only the question being discussed.",
        "Return to the handout when the answer is complete.",
    ]
    y = 2.68 * inch
    pdf.setFont("Helvetica", 11)
    for item in checklist:
        pdf.setFillColor(HexColor("#85D7C0"))
        pdf.circle(1.22 * inch, y + 0.04 * inch, 0.07 * inch, fill=1, stroke=0)
        pdf.setFillColor(WHITE)
        pdf.drawString(1.48 * inch, y, item)
        y -= 0.48 * inch

    pdf.setFillColor(HexColor("#FFF3D6"))
    pdf.roundRect(8.38 * inch, 1.2 * inch, 4.18 * inch, 2.55 * inch, 18, fill=1, stroke=0)
    pdf.setFillColor(AMBER)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(8.75 * inch, 3.15 * inch, "DEMO CHECKPOINT")
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(8.75 * inch, 2.58 * inch, "Page 3")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 10.5)
    pdf.drawString(8.75 * inch, 2.12 * inch, "Set this page manually")
    pdf.drawString(8.75 * inch, 1.78 * inch, "inside the Web Builder.")
    footer(pdf, 3)


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=(WIDTH, HEIGHT), pageCompression=1)
    pdf.setTitle("Paper Lab Synthetic Demo Handout")
    pdf.setAuthor("Paper Lab contributors")
    pdf.setSubject("Redistributable synthetic content for testing Paper Lab")
    for draw_page in (page_one, page_two, page_three):
        draw_page(pdf)
        pdf.showPage()
    pdf.save()
    print(f"PASS demo PDF: {OUTPUT}")


if __name__ == "__main__":
    main()
