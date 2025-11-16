from typing import Optional
import PyPDF2
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class DocumentProcessor:
    # processes and extracts text from various document formats

    def extract_text_from_pdf(self, file_path: str) -> str:
        # input: pdf file path; extracts text; output: extracted text
        try:
            with open(file_path, "rb") as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text_parts = []

                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)

                full_text = "\n".join(text_parts)
                logger.info(
                    f"Extracted {len(full_text)} characters from PDF: {file_path}"
                )
                return full_text

        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
            raise

    def extract_text_from_txt(self, file_path: str) -> str:
        # input: txt file path; reads text; output: file content
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                text = file.read()

            logger.info(f"Read {len(text)} characters from TXT: {file_path}")
            return text

        except UnicodeDecodeError:
            try:
                with open(file_path, "r", encoding="latin-1") as file:
                    text = file.read()
                logger.info(
                    f"Read {len(text)} characters from TXT (latin-1): {file_path}"
                )
                return text
            except Exception as e:
                logger.error(f"Error reading text file {file_path}: {str(e)}")
                raise
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {str(e)}")
            raise

    def extract_text(self, file_path: str, file_type: str) -> str:
        # input: file path, type; routes to extractor; output: extracted text
        file_type_lower = file_type.lower()

        if file_type_lower == "pdf":
            return self.extract_text_from_pdf(file_path)
        elif file_type_lower in ["txt", "text"]:
            return self.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    def clean_text(self, text: str) -> str:
        # input: raw text; cleans text; output: cleaned text
        text = text.replace("\x00", "")
        text = " ".join(text.split())
        text = text.strip()

        return text
