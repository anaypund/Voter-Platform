#!/usr/bin/env python3
"""
Translation script to convert English text to Marathi
"""
import sys
import json

try:
    from deep_translator import GoogleTranslator
    
    def translate_to_marathi(text):
        """Translate text from auto-detected language to Marathi"""
        if not text or not text.strip():
            return text
        
        try:
            translator = GoogleTranslator(source='auto', target='mr')
            translated = translator.translate(text=text.strip())

            # Canonicalize the translated text
            translated = canonicalize_marathi(translated)
            return translated
        except Exception as e:
            print(f"Translation error: {str(e)}", file=sys.stderr)
            # Return original text if translation fails
            return text
        
    import re

    def canonicalize_marathi(name: str) -> str:
        if not name:
            return ""
        
        # Build once and reuse
        CANONICAL_MAP = {
            # Retroflex → Dental
            "ट": "त", "ठ": "थ", "ड": "द", "ढ": "ध", "ण": "न",

            # L
            "ळ": "ल",

            # S
            "ष": "श",

            # Long → Short vowels
            "आ": "अ",
            "ई": "इ",
            "ऊ": "उ",
        }

        name = str(name).strip()

        # 1. Replace unstable characters
        for src, tgt in CANONICAL_MAP.items():
            name = name.replace(src, tgt)

        # 2. Normalize combining vowel signs
        vowel_map = {
            "ा": "",   # remove long aakar
            "ी": "ि",
            "ू": "ु",
        }

        for src, tgt in vowel_map.items():
            name = name.replace(src, tgt)

        return name

    
    # Read input from command line argument
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        result = translate_to_marathi(input_text)
        # Output as JSON for easy parsing in Node.js
        print(json.dumps({"translated": result, "original": input_text}))
    else:
        print(json.dumps({"error": "No input text provided"}))
        sys.exit(1)

except ImportError:
    print(json.dumps({"error": "deep_translator not installed. Run: pip install deep_translator"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
