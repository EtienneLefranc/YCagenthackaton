#!/usr/bin/env python3
"""
Test script for the Market Research Generator module
"""

from market_research import MarketResearchGenerator
import json

def test_market_research():
    """Test the market research generator functionality"""
    
    print("🧪 Testing Market Research Generator Module")
    print("=" * 50)
    
    # Initialize the generator
    generator = MarketResearchGenerator()
    
    # Check status
    print("\n📊 Module Status:")
    status = generator.get_status()
    print(json.dumps(status, indent=2))
    
    # Test data
    problem_statement = "Small businesses struggle to manage inventory efficiently"
    user_answers = [
        {
            "question": "What industry is this problem in?",
            "answer": "Retail and e-commerce, particularly small retail stores and online sellers"
        },
        {
            "question": "Who are the primary customers?",
            "answer": "Small business owners and managers with 1-50 employees"
        },
        {
            "question": "What is the estimated market size?",
            "answer": "Over 30 million small businesses in the US, with about 8 million in retail"
        },
        {
            "question": "How urgent is this problem?",
            "answer": "Very urgent - affects daily operations, customer satisfaction, and profitability"
        },
        {
            "question": "What are the main challenges?",
            "answer": "Manual tracking, stockouts, overstocking, time management, and lack of real-time visibility"
        },
        {
            "question": "What is the geographic scope?",
            "answer": "Primarily US market, but also applicable globally"
        },
        {
            "question": "What technology solutions exist?",
            "answer": "Existing solutions are expensive, complex, and designed for larger enterprises"
        }
    ]
    
    # Validate inputs
    print("\n✅ Input Validation:")
    validation = generator.validate_inputs(problem_statement, user_answers)
    print(json.dumps(validation, indent=2))
    
    if not validation['valid']:
        print("❌ Validation failed. Cannot proceed.")
        return
    
    # Generate report
    print("\n🚀 Generating Market Research Report...")
    print("(This may take a few moments as it calls Claude API)")
    
    result = generator.generate_report(problem_statement, user_answers)
    
    if result['success']:
        print("\n✅ Report Generated Successfully!")
        print(f"🤖 Model Used: {result['model_used']}")
        print(f"📝 Generation Method: {result['generation_method']}")
        print("\n📋 MARKET RESEARCH REPORT:")
        print("=" * 60)
        print(result['report'])
        print("=" * 60)
    else:
        print("\n❌ Report Generation Failed:")
        print(f"Error: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    test_market_research()
