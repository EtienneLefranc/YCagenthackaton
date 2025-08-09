#!/usr/bin/env python3
"""
Example of how to integrate the Market Research Generator with Flask
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from market_research import MarketResearchGenerator
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize the market research generator
market_research = MarketResearchGenerator()

@app.route('/api/market-research/status', methods=['GET'])
def market_research_status():
    """Get the status of the market research generator"""
    return jsonify(market_research.get_status())

@app.route('/api/market-research/validate', methods=['POST'])
def validate_market_research_inputs():
    """Validate inputs before generating report"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        problem_statement = data.get('problem_statement', '').strip()
        user_answers = data.get('user_answers', [])
        
        # Validate inputs
        validation = market_research.validate_inputs(problem_statement, user_answers)
        
        return jsonify({
            'success': True,
            'valid': validation['valid'],
            'errors': validation['errors']
        })
        
    except Exception as e:
        logger.error(f"Error validating inputs: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/market-research/generate', methods=['POST'])
def generate_market_research_report():
    """Generate a market research report"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        problem_statement = data.get('problem_statement', '').strip()
        user_answers = data.get('user_answers', [])
        
        # Validate inputs first
        validation = market_research.validate_inputs(problem_statement, user_answers)
        if not validation['valid']:
            return jsonify({
                'success': False,
                'error': 'Input validation failed',
                'validation_errors': validation['errors']
            }), 400
        
        # Generate the report
        logger.info(f"Generating market research report for: {problem_statement}")
        result = market_research.generate_report(problem_statement, user_answers)
        
        if result['success']:
            logger.info("Report generated successfully")
            return jsonify(result)
        else:
            logger.error(f"Report generation failed: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error occurred'
        }), 500

@app.route('/api/market-research/health', methods=['GET'])
def market_research_health():
    """Health check for market research service"""
    status = market_research.get_status()
    
    return jsonify({
        'service': 'Market Research Generator',
        'status': 'healthy' if status['status'] == 'active' else 'unhealthy',
        'claude_api_configured': status['api_configured'],
        'model': status['model'],
        'timestamp': '2025-08-09T13:30:00Z'
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'service': 'Market Research Generator API',
        'version': '1.0.0',
        'description': 'Generate comprehensive market research reports using Claude AI',
        'endpoints': {
            'status': '/api/market-research/status (GET)',
            'validate': '/api/market-research/validate (POST)',
            'generate': '/api/market-research/generate (POST)',
            'health': '/api/market-research/health (GET)'
        },
        'usage': {
            'validate': 'POST /api/market-research/validate with {"problem_statement": "...", "user_answers": [...]}',
            'generate': 'POST /api/market-research/generate with {"problem_statement": "...", "user_answers": [...]}'
        },
        'note': 'Set ANTHROPIC_API_KEY environment variable to use Claude AI'
    })

if __name__ == '__main__':
    # Check market research service status on startup
    status = market_research.get_status()
    if status['status'] == 'active':
        logger.info(f"Market Research Generator ready with model: {status['model']}")
    else:
        logger.warning(f"Market Research Generator status: {status['status']}")
        logger.warning("Set ANTHROPIC_API_KEY environment variable to enable Claude AI")
    
    app.run(debug=True, host='0.0.0.0', port=5002)
