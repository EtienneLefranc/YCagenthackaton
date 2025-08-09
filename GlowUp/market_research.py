import os
import requests
import json
import logging
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables from both .env and config.env
load_dotenv('.env')
load_dotenv('config.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketResearchGenerator:
    """
    Market Research Report Generator using Anthropic Claude API
    """
    
    def __init__(self):
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        self.model = os.getenv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022')
        self.max_tokens = int(os.getenv('MAX_TOKENS', '4000'))
        self.temperature = float(os.getenv('TEMPERATURE', '0.7'))
        self.base_url = "https://api.anthropic.com/v1/messages"
        
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY not found in environment variables")
    
    def call_claude_api(self, prompt: str) -> Optional[str]:
        """
        Call Anthropic Claude API to generate market research report
        """
        if not self.api_key:
            logger.error("Cannot call Claude API: API key not configured")
            return None
            
        try:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01"
            }
            
            data = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['content'][0]['text']
            else:
                logger.error(f"Claude API call failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error calling Claude API: {str(e)}")
            return None
    
    def generate_report(self, problem_statement: str, user_answers: List[Dict]) -> Dict:
        """
        Generate a comprehensive market research report based on problem statement and user answers
        """
        try:
            # Construct the prompt for Claude
            prompt = self._build_report_prompt(problem_statement, user_answers)
            
            # Call Claude API
            report_content = self.call_claude_api(prompt)
            
            if report_content:
                return {
                    'success': True,
                    'problem_statement': problem_statement,
                    'report': report_content,
                    'generation_method': 'claude_ai',
                    'model_used': self.model
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to generate report using Claude API'
                }
                
        except Exception as e:
            logger.error(f"Error generating report: {str(e)}")
            return {
                'success': False,
                'error': f'Internal error: {str(e)}'
            }
    
    def _build_report_prompt(self, problem_statement: str, user_answers: List[Dict]) -> str:
        """
        Build a comprehensive prompt for Claude to generate market research report
        """
        # Format user answers for the prompt
        answers_text = "\n".join([
            f"Q{i+1}: {answer.get('question', 'Unknown question')}\n"
            f"A{i+1}: {answer.get('answer', 'No answer provided')}\n"
            for i, answer in enumerate(user_answers)
        ])
        
        prompt = f"""You are an expert market research analyst. Based on the problem statement and user answers below, generate a comprehensive market research report.

PROBLEM STATEMENT:
{problem_statement}

USER ANSWERS:
{answers_text}

Please generate a detailed market research report with the following structure:

## Executive Summary
- Brief overview of the problem and market opportunity
- Key findings and recommendations

## Market Analysis
- Market size and growth potential
- Industry trends and drivers
- Market segmentation

## Competitive Landscape
- Key competitors and their positioning
- Competitive advantages and disadvantages
- Market share analysis

## Customer Insights
- Target customer segments
- Customer pain points and needs
- Customer behavior and preferences

## Market Opportunity
- Market gap analysis
- Revenue potential
- Entry barriers and challenges

## Recommendations
- Strategic recommendations
- Implementation roadmap
- Risk mitigation strategies

## Conclusion
- Summary of key insights
- Next steps

Make the report professional, data-driven, and actionable. Use the user's answers to provide specific insights and recommendations. Keep each section concise but comprehensive."""

        return prompt
    
    def validate_inputs(self, problem_statement: str, user_answers: List[Dict]) -> Dict:
        """
        Validate the inputs before generating the report
        """
        errors = []
        
        if not problem_statement or not problem_statement.strip():
            errors.append("Problem statement is required")
        
        if not user_answers or not isinstance(user_answers, list):
            errors.append("User answers must be a list")
        elif len(user_answers) == 0:
            errors.append("At least one user answer is required")
        else:
            for i, answer in enumerate(user_answers):
                if not isinstance(answer, dict):
                    errors.append(f"Answer {i+1} must be a dictionary")
                elif 'question' not in answer or 'answer' not in answer:
                    errors.append(f"Answer {i+1} must contain 'question' and 'answer' fields")
                elif not answer.get('answer', '').strip():
                    errors.append(f"Answer {i+1} cannot be empty")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def get_status(self) -> Dict:
        """
        Get the status of the market research generator
        """
        return {
            'service': 'Market Research Report Generator',
            'status': 'active' if self.api_key else 'inactive',
            'model': self.model,
            'max_tokens': self.max_tokens,
            'temperature': self.temperature,
            'api_configured': bool(self.api_key)
        }


# Example usage and testing
if __name__ == "__main__":
    # Test the module
    generator = MarketResearchGenerator()
    
    # Check status
    status = generator.get_status()
    print("Status:", json.dumps(status, indent=2))
    
    # Example problem and answers
    problem = "Small businesses struggle to manage inventory efficiently"
    answers = [
        {"question": "What industry is this problem in?", "answer": "Retail and e-commerce"},
        {"question": "Who are the primary customers?", "answer": "Small business owners and managers"},
        {"question": "What is the estimated market size?", "answer": "Over 30 million small businesses in the US"},
        {"question": "How urgent is this problem?", "answer": "Very urgent - affects daily operations and profitability"},
        {"question": "What are the main challenges?", "answer": "Manual tracking, stockouts, overstocking, and time management"}
    ]
    
    # Validate inputs
    validation = generator.validate_inputs(problem, answers)
    print("\nValidation:", json.dumps(validation, indent=2))
    
    if validation['valid']:
        print("\nGenerating report...")
        report = generator.generate_report(problem, answers)
        print("\nReport Result:", json.dumps(report, indent=2))
    else:
        print("\nInput validation failed:", validation['errors'])
