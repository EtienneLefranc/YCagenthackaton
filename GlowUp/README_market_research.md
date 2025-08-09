# Market Research Generator Module

This module generates comprehensive market research reports using Anthropic Claude API based on problem statements and user answers.

## Features

- **AI-Powered Reports**: Uses Claude AI to generate professional market research reports
- **Structured Output**: Generates reports with Executive Summary, Market Analysis, Competitive Landscape, Customer Insights, Market Opportunity, Recommendations, and Conclusion
- **Input Validation**: Validates problem statements and user answers before processing
- **Error Handling**: Robust error handling with fallback mechanisms
- **Configurable**: Easy to configure API keys and models

## Setup

### 1. Install Dependencies
```bash
pip install requests python-dotenv
```

### 2. Environment Variables
Create a `.env` file in your project root:
```bash
# Anthropic Claude API Configuration
ANTHROPIC_API_KEY=your_actual_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 3. Get Anthropic API Key
- Sign up at [Anthropic Console](https://console.anthropic.com/)
- Create an API key
- Add it to your `.env` file

## Usage

### Basic Usage
```python
from market_research import MarketResearchGenerator

# Initialize the generator
generator = MarketResearchGenerator()

# Generate a report
problem = "Small businesses struggle to manage inventory efficiently"
answers = [
    {"question": "What industry?", "answer": "Retail and e-commerce"},
    {"question": "Who are customers?", "answer": "Small business owners"},
    # ... more answers
]

result = generator.generate_report(problem, answers)

if result['success']:
    print(result['report'])
else:
    print(f"Error: {result['error']}")
```

### Input Format

**Problem Statement**: A clear, one-line description of the business problem

**User Answers**: List of dictionaries with:
```python
{
    "question": "The question that was asked",
    "answer": "The user's response to that question"
}
```

### Output Format

The generated report includes:
- **Executive Summary**: Overview and key recommendations
- **Market Analysis**: Market size, trends, segmentation
- **Competitive Landscape**: Competitor analysis
- **Customer Insights**: Target segments and pain points
- **Market Opportunity**: Gap analysis and revenue potential
- **Recommendations**: Strategic guidance and roadmap
- **Conclusion**: Summary and next steps

## API Methods

### `generate_report(problem_statement, user_answers)`
Generates a market research report.

**Parameters:**
- `problem_statement` (str): The business problem to analyze
- `user_answers` (list): List of question-answer dictionaries

**Returns:**
- Success: Dictionary with report content and metadata
- Failure: Dictionary with error information

### `validate_inputs(problem_statement, user_answers)`
Validates input data before processing.

**Returns:**
- Dictionary with validation status and any error messages

### `get_status()`
Gets the current status of the generator.

**Returns:**
- Dictionary with service status and configuration

## Testing

Run the test script to verify functionality:
```bash
python3 test_market_research.py
```

## Error Handling

The module handles various error scenarios:
- Missing API key
- API call failures
- Invalid input data
- Network timeouts
- JSON parsing errors

## Configuration Options

### Model Selection
You can use different Claude models:
- `claude-3-5-sonnet-20241022` (default, balanced)
- `claude-3-haiku-20240307` (fast, cost-effective)
- `claude-3-opus-20240229` (most capable, slower)

### Token Limits
- Default: 4000 tokens
- Adjustable in the `call_claude_api` method

## Integration

This module can be easily integrated into:
- Flask/FastAPI applications
- Django projects
- Command-line tools
- Data processing pipelines
- Web services

## Example Integration with Flask

```python
from flask import Flask, request, jsonify
from market_research import MarketResearchGenerator

app = Flask(__name__)
generator = MarketResearchGenerator()

@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    data = request.get_json()
    problem = data.get('problem_statement')
    answers = data.get('user_answers')
    
    result = generator.generate_report(problem, answers)
    return jsonify(result)
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `.env` file exists and contains `ANTHROPIC_API_KEY`
   - Check that `python-dotenv` is installed

2. **API Call Failures**
   - Verify API key is valid
   - Check internet connection
   - Ensure Anthropic service is accessible

3. **Input Validation Errors**
   - Check that all required fields are present
   - Ensure answers are not empty
   - Verify data structure matches expected format

### Debug Mode
Enable debug logging by setting log level:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## License

This module is provided as-is for educational and development purposes.
