from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'ChatGPT Usage Transparency Report', 0, 1, 'C')
        self.ln(10)

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 7, body)
        self.ln()

pdf = PDF()
pdf.add_page()

# Introduction
pdf.chapter_title('1. Usage Overview')
pdf.chapter_body(
    "This project 'Gemscap' was developed leveraging the capabilities of Large Language Models (LLMs) "
    "to accelerate the software development lifecycle. The AI acted as a technical consultant and "
    "pair programmer, assisting in architectural decisions, code optimization, and rapid debugging, "
    "while the core logic and system design were directed by me."
)

# Financial Terms
# ... (same as before) ...

# Conclusion
pdf.chapter_title('5. Conclusion')
pdf.chapter_body(
    "The integration of Generative AI into my development workflow significantly reduced the time-to-market "
    "for Gemscap. Rather than writing every line of boilerplate, I could focus on high-level "
    "strategy and system integrity. The result is a sophisticated, production-grade quantitative dashboard "
    "built with speed and precision, demonstrating the power of human-AI collaboration in modern software engineering."
)

output_path = r"C:\Users\Sujal Tagalpallewar\.gemini\antigravity\brain\f8d44e06-6a81-4929-b4f2-75599038a522\chatgpt_usage.pdf"
pdf.output(output_path, 'F')
print(f"PDF generated successfully at {output_path}")
