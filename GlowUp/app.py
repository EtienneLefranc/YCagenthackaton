from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import logging
from market_research import MarketResearchGenerator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "mistral:latest"  # You can change this to any model you have in Ollama

def call_ollama(prompt, model=OLLAMA_MODEL, prompt_type="questions"):
    """
    Call Ollama API to generate content using local LLM.
    This function can generate either questions or market research reports.
    """
    try:
        # Prepare the system prompt based on the type of content needed
        if prompt_type == "questions":
            system_prompt = """You are a market research expert. Generate 5-8 simple, clear questions to understand a business problem.

Focus on these key areas:
1. What industry/market is this?
2. Who are the customers?
3. How big is the opportunity?
4. What are the main challenges?
5. How urgent is this problem?

Keep questions short and simple. Use basic language.

Return ONLY a JSON array like this:
[
  {
    "id": "q1",
    "question": "What industry is this problem in?",
    "type": "text",
    "required": true,
    "order": 1
  }
]"""
        else:  # report generation
            system_prompt = """You are an expert market research analyst. Generate a comprehensive market research report based on the problem statement provided.

Focus on providing actionable insights, market analysis, competitive landscape, customer insights, and strategic recommendations.

Write the report in a professional, structured format with clear sections and bullet points where appropriate."""
        
        # Combine system prompt with user input
        if prompt_type == "questions":
            full_prompt = f"{system_prompt}\n\nProblem Statement: {prompt}\n\nGenerate questions:"
        else:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        # Call Ollama API
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": model,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "max_tokens": 800 if prompt_type == "questions" else 2000
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            generated_text = result.get('response', '')
            
            if prompt_type == "questions":
                # Try to extract JSON from the response for questions
                try:
                    # Find JSON array in the response
                    start_idx = generated_text.find('[')
                    end_idx = generated_text.rfind(']') + 1
                    
                    if start_idx != -1 and end_idx != -1:
                        json_str = generated_text[start_idx:end_idx]
                        questions = json.loads(json_str)
                        
                        # Validate and clean the questions
                        cleaned_questions = []
                        for i, q in enumerate(questions):
                            if isinstance(q, dict) and 'question' in q:
                                cleaned_question = {
                                    'id': q.get('id', f'q_{i+1}'),
                                    'question': q.get('question', ''),
                                    'type': q.get('type', 'text'),
                                    'required': q.get('required', True),
                                    'order': q.get('order', i+1),
                                    'options': q.get('options', []) if q.get('type') == 'select' else None
                                }
                                cleaned_questions.append(cleaned_question)
                        
                        return cleaned_questions
                    else:
                        logger.warning("No JSON array found in LLM response")
                        return generate_fallback_questions(prompt)
                        
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse JSON from LLM response: {e}")
                    return generate_fallback_questions(prompt)
            else:
                # For report generation, return the text directly
                return generated_text
        else:
            logger.error(f"Ollama API call failed: {response.status_code}")
            if prompt_type == "questions":
                return generate_fallback_questions(prompt)
            else:
                return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Ollama API: {e}")
        if prompt_type == "questions":
            return generate_fallback_questions(prompt)
        else:
            return None
    except Exception as e:
        logger.error(f"Unexpected error in Ollama call: {e}")
        if prompt_type == "questions":
            return generate_fallback_questions(prompt)
        else:
            return None

def generate_fallback_questions(problem_statement):
    """
    Fallback question generation if Ollama fails.
    This ensures the API always returns questions.
    """
    logger.info("Using fallback question generation")
    
    # Basic questions that work for any problem
    fallback_questions = [
        {
            'id': 'industry',
            'question': 'What industry does this problem belong to?',
            'type': 'text',
            'required': True,
            'order': 1
        },
        {
            'id': 'target_audience',
            'question': 'Who is the primary target audience for this solution?',
            'type': 'text',
            'required': True,
            'order': 2
        },
        {
            'id': 'geographic_scope',
            'question': 'What is the geographic scope of this market?',
            'type': 'select',
            'options': ['Local', 'Regional', 'National', 'Global'],
            'required': True,
            'order': 3
        },
        {
            'id': 'market_size',
            'question': 'What is your estimated market size?',
            'type': 'select',
            'options': ['Under $1M', '$1M-$10M', '$10M-$100M', '$100M-$1B', 'Over $1B'],
            'required': True,
            'order': 4
        },
        {
            'id': 'urgency',
            'question': 'How urgent is this problem for customers?',
            'type': 'select',
            'options': ['Low', 'Medium', 'High', 'Critical'],
            'required': True,
            'order': 5
        },
        
    ]
    
    return fallback_questions

def check_ollama_status():
    """
    Check if Ollama is running and available.
    This helps with debugging and status monitoring.
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            return {
                'status': 'running',
                'available_models': [model['name'] for model in models],
                'current_model': OLLAMA_MODEL
            }
        else:
            return {'status': 'error', 'message': f'HTTP {response.status_code}'}
    except requests.exceptions.RequestException as e:
        return {'status': 'error', 'message': str(e)}

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions_endpoint():
    """
    Main endpoint that takes a problem statement and uses Ollama to generate intelligent questions.
    This is the core functionality using local LLM.
    """
    try:
        # Get the problem statement from the request
        data = request.get_json()
        
        if not data or 'problem_statement' not in data:
            return jsonify({
                'success': False,
                'error': 'Problem statement is required'
            }), 400
        
        problem_statement = data['problem_statement'].strip()
        
        # Validate input
        if not problem_statement:
            return jsonify({
                'success': False,
                'error': 'Problem statement cannot be empty'
            }), 400
        
        if len(problem_statement) > 1000:
            return jsonify({
                'success': False,
                'error': 'Problem statement must be under 1000 characters'
            }), 400
        
        if len(problem_statement) < 10:
            return jsonify({
                'success': False,
                'error': 'Problem statement must be at least 10 characters'
            }), 400
        
        # Use Ollama to generate intelligent questions
        questions = call_ollama(problem_statement, prompt_type="questions")
        
        # Return the generated questions
        return jsonify({
            'success': True,
            'problem_statement': problem_statement,
            'total_questions': len(questions),
            'questions': questions,
            'generation_method': 'ollama_llm'
        })
        
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error occurred'
        }), 500

@app.route('/api/ollama-status', methods=['GET'])
def ollama_status():
    """
    Check Ollama status and available models.
    Useful for debugging and monitoring.
    """
    status = check_ollama_status()
    return jsonify(status)

@app.route('/api/generate-report', methods=['POST'])
def generate_report_endpoint():
    """
    Generate a comprehensive market research report using the MarketResearchGenerator
    """
    try:
        # Get the problem statement and user answers from the request
        data = request.get_json()
        
        if not data or 'problem_statement' not in data:
            return jsonify({
                'success': False,
                'error': 'Problem statement is required'
            }), 400
        
        problem_statement = data['problem_statement'].strip()
        user_answers = data.get('user_answers', [])  # Make user_answers optional
        
        # Validate inputs
        if not problem_statement:
            return jsonify({
                'success': False,
                'error': 'Problem statement cannot be empty'
            }), 400
        
        # If no user answers provided, create a basic report from just the problem statement
        if not user_answers or len(user_answers) == 0:
            return generate_basic_report(problem_statement)
        
        # Initialize the market research generator
        generator = MarketResearchGenerator()
        
        # Validate inputs using the generator's validation method
        validation = generator.validate_inputs(problem_statement, user_answers)
        if not validation['valid']:
            return jsonify({
                'success': False,
                'error': f'Input validation failed: {", ".join(validation["errors"])}'
            }), 500
        
        # Generate the report
        report_result = generator.generate_report(problem_statement, user_answers)
        
        if report_result['success']:
            return jsonify({
                'success': True,
                'problem_statement': problem_statement,
                'report': report_result['report'],
                'generation_method': report_result['generation_method'],
                'model_used': report_result['model_used']
            })
        else:
            return jsonify({
                'success': False,
                'error': report_result['error']
            }), 500
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error occurred'
        }), 500

def generate_basic_report(problem_statement):
    """
    Generate a basic market research report from just the problem statement
    """
    try:
        # Initialize the market research generator
        generator = MarketResearchGenerator()
        
        # Create a comprehensive prompt for generating a structured MBA-worthy report
        prompt = f"""You are an expert market research analyst and MBA consultant. Based on the problem statement below, generate a comprehensive, structured market research report that would be suitable for MBA-level analysis.

PROBLEM STATEMENT:
{problem_statement}

Please generate a detailed, structured market research report with the following EXACT format and structure:

## Executive Summary
- Brief overview of the problem and market opportunity
- Key findings and recommendations
- Market size and growth potential

## Market Analysis & Market Maps
- Market size and growth potential with specific numbers
- Industry trends and drivers
- Market segmentation with percentages
- Geographic market breakdown
- Market maturity analysis

## Ideal Customer Profile (ICP)
- Primary target customer segments with detailed characteristics
- Customer pain points and needs
- Customer behavior and preferences
- Customer acquisition channels
- Customer lifetime value estimates

## Competitive Landscape Breakdown
- Key competitors categorized by type (Enterprise, Mid-market, SMB)
- Competitive positioning matrix
- Market share analysis with percentages
- Competitive advantages and disadvantages
- Pricing comparison table
- Feature comparison matrix

## Pricing Guidance & Business Model
- Pricing strategy recommendations
- Pricing tiers and structure
- Revenue model suggestions
- Cost structure analysis
- Profitability projections
- Pricing sensitivity analysis

## Strategic Recommendations
- Go-to-market strategy
- Implementation roadmap with timelines
- Risk mitigation strategies
- Success metrics and KPIs

## Financial Projections
- Market penetration assumptions
- Revenue projections (3-5 years)
- Customer acquisition costs
- Break-even analysis

Make the report professional, data-driven, and actionable. Include specific numbers, percentages, and data points where possible. Structure the information in a way that's easy to read and analyze. Focus on providing actionable insights for business strategy and decision-making.

Format the report with clear sections, bullet points, and structured information that can be easily parsed and displayed in a web interface."""

        # Try to use Claude API first, fallback to Ollama if no API key
        if generator.api_key:
            report_content = generator.call_claude_api(prompt)
            generation_method = 'claude_ai_direct'
        else:
            # Use Ollama as fallback
            logger.info("No Anthropic API key found, using Ollama as fallback")
            report_content = call_ollama(prompt, prompt_type="report")
            generation_method = 'ollama_llm_fallback'
        
        if report_content:
            # Parse the report content to extract structured sections
            structured_report = parse_report_sections(report_content)
            
            return jsonify({
                'success': True,
                'problem_statement': problem_statement,
                'report': report_content,
                'structured_report': structured_report,
                'generation_method': generation_method,
                'model_used': generator.model if generator.api_key else 'mistral:latest'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate report using available AI services'
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating basic report: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500

def parse_report_sections(report_content):
    """
    Parse the report content to extract structured sections for better frontend display
    """
    try:
        sections = {}
        current_section = None
        current_content = []
        
        lines = report_content.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Check if this is a section header
            if line.startswith('## '):
                # Save previous section if exists
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = line[3:].strip()  # Remove '## '
                current_content = []
            elif current_section and line:
                current_content.append(line)
        
        # Save the last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
        return sections
        
    except Exception as e:
        logger.error(f"Error parsing report sections: {str(e)}")
        return {'Full Report': report_content}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint that also shows Ollama status"""
    ollama_status_info = check_ollama_status()
    
    return jsonify({
        'status': 'healthy',
        'service': 'Question Generator API with Ollama',
        'version': '1.0.0',
        'ollama': ollama_status_info
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with information about the API"""
    return jsonify({
        'service': 'Market Research Question Generator with Ollama LLM',
        'endpoints': {
            'generate_questions': '/api/generate-questions (POST)',
            'ollama_status': '/api/ollama-status (GET)',
            'health_check': '/api/health (GET)'
        },
        'usage': 'Send a POST request to /api/generate-questions with {"problem_statement": "your problem here"}',
        'ollama_model': OLLAMA_MODEL,
        'ollama_url': OLLAMA_BASE_URL
    })

if __name__ == '__main__':
    # Check Ollama status on startup
    status = check_ollama_status()
    if status['status'] == 'running':
        logger.info(f"Ollama is running with model: {OLLAMA_MODEL}")
        logger.info(f"Available models: {status['available_models']}")
    else:
        logger.warning(f"Ollama status: {status}")
        logger.warning("Questions will be generated using fallback method")
    
    app.run(debug=True, host='0.0.0.0', port=5001)