from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "mistral:latest"  # You can change this to any model you have in Ollama

def call_ollama(prompt, model=OLLAMA_MODEL):
    """
    Call Ollama API to generate questions using local LLM.
    This is the core function that uses AI to generate intelligent questions.
    """
    try:
        # Prepare the prompt for the LLM
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

        # Combine system prompt with user input
        full_prompt = f"{system_prompt}\n\nProblem Statement: {prompt}\n\nGenerate questions:"

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
                    "max_tokens": 800
                }
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            generated_text = result.get('response', '')
            
            # Try to extract JSON from the response
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
            logger.error(f"Ollama API call failed: {response.status_code}")
            return generate_fallback_questions(prompt)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Ollama API: {e}")
        return generate_fallback_questions(prompt)
    except Exception as e:
        logger.error(f"Unexpected error in Ollama call: {e}")
        return generate_fallback_questions(prompt)

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
        questions = call_ollama(problem_statement)
        
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