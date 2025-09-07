# ProContent Flagger

Advanced AI-powered content moderation system that detects threats, harassment, misinformation, and other problematic content before it gets posted to social media.

## Features

- **Multiple Detection Categories**: Threats, self-harm, harassment, hate speech, misinformation, spam, coordinated behavior, PII, and violence
- **Text Normalization**: Handles leetspeak, obfuscation, repeated characters, and diacritics
- **Contextual Analysis**: Considers negation, direct targeting, and context windows
- **High-Performance Caching**: Built-in caching for repeated content analysis
- **Explainable Results**: Provides evidence and confidence scores for all detections

## Quick Start

```bash
# Install dependencies
npm install

# Use CLI (builds automatically)
npm run cli -- --text "Your content here"

# Or build manually first
npm run build
node dist/cli.js --text "Content to analyze"

# Run tests
npm test
```

## CLI Usage

```bash
# Analyze text directly
npm run cli -- --text "I will hurt you"

# Analyze from stdin
npm run cli -- --stdin < content.txt

# Get JSON output
npm run cli -- --text "Content to analyze" --json

# Or use built CLI directly
node dist/cli.js --text "Content to analyze" --json
```

## Example Output

```json
{
  "decision": "block",
  "score": 1.0,
  "category_max": "threat",
  "signals": [
    {
      "id": "threat",
      "category": "threat", 
      "score": 1.0,
      "evidence": [
        {
          "span": "hurt you",
          "index": 7
        }
      ]
    }
  ],
  "normalized": "i will hurt you",
  "original": "I will hurt you"
}
```

## Project Structure

```
procontent-flagger/
├── src/                    # Source code
│   ├── engine.ts          # Core analysis engine  
│   ├── cli.ts             # Command-line interface
│   ├── policy.ts          # Thresholds and weights
│   ├── types.ts           # TypeScript definitions
│   ├── detectors/         # Detection algorithms
│   └── utils/             # Utility functions
├── tests/                 # Test suite
├── dist/                  # Compiled JavaScript
└── README.md              # This file
```

## Configuration

Thresholds and weights can be adjusted in `src/policy.ts`:

- **Block threshold**: 0.8 (scores ≥ 0.8 are blocked)
- **Review threshold**: 0.4 (scores 0.4-0.8 need review)
- **Allow threshold**: < 0.4 (scores < 0.4 are allowed)

## Detection Categories

The system detects 11 different types of problematic content:

1. **Threats** - Direct or indirect threats to individuals or groups
2. **Self-harm** - Content promoting self-injury or suicide
3. **Harassment** - Personal attacks, insults, and cyberbullying
4. **Hate Speech** - Attacks based on protected characteristics
5. **Sexual Content + Minors** - Inappropriate sexual content involving minors
6. **Graphic Violence** - Descriptions of violent acts
7. **Sexual Violence** - Non-consensual sexual content
8. **Misinformation** - False claims about health, politics, etc.
9. **PII** - Personal identifiable information leaks
10. **Coordinated Behavior** - Bot-like or spam behavior
11. **Spam** - Commercial spam and scams