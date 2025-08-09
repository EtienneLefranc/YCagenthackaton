#!/usr/bin/env python3
"""
Test script for input validation in the Market Research Generator
"""

from market_research import MarketResearchGenerator
import json

def test_validation():
    """Test various input validation scenarios"""
    
    print("🧪 Testing Input Validation")
    print("=" * 40)
    
    generator = MarketResearchGenerator()
    
    # Test cases
    test_cases = [
        {
            "name": "Valid inputs",
            "problem": "Small businesses struggle with inventory",
            "answers": [
                {"question": "What industry?", "answer": "Retail"}
            ],
            "should_be_valid": True
        },
        {
            "name": "Empty problem statement",
            "problem": "",
            "answers": [{"question": "Q1", "answer": "A1"}],
            "should_be_valid": False
        },
        {
            "name": "Missing answers",
            "problem": "Valid problem",
            "answers": [],
            "should_be_valid": False
        },
        {
            "name": "Invalid answer format",
            "problem": "Valid problem",
            "answers": [{"question": "Q1"}],  # Missing 'answer' field
            "should_be_valid": False
        },
        {
            "name": "Empty answer",
            "problem": "Valid problem",
            "answers": [{"question": "Q1", "answer": ""}],
            "should_be_valid": False
        },
        {
            "name": "Multiple valid answers",
            "problem": "Valid problem statement here",
            "answers": [
                {"question": "What industry?", "answer": "Technology"},
                {"question": "Who are customers?", "answer": "Developers"},
                {"question": "Market size?", "answer": "Large"}
            ],
            "should_be_valid": True
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 Test {i}: {test_case['name']}")
        print(f"Problem: '{test_case['problem']}'")
        print(f"Answers: {len(test_case['answers'])} answers")
        
        validation = generator.validate_inputs(
            test_case['problem'], 
            test_case['answers']
        )
        
        print(f"Valid: {validation['valid']}")
        if not validation['valid']:
            print(f"Errors: {validation['errors']}")
        
        # Check if result matches expectation
        if validation['valid'] == test_case['should_be_valid']:
            print("✅ PASS")
        else:
            print("❌ FAIL - Expected different validation result")
        
        print("-" * 40)

if __name__ == "__main__":
    test_validation()
