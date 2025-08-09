const API_BASE_URL = 'http://localhost:5001'

export const marketResearchService = {
  /**
   * Generate market research questions based on a problem statement
   * @param {string} problemStatement - The business problem or opportunity description
   * @returns {Promise<Object>} - Generated questions and metadata
   */
  async generateQuestions(problemStatement) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem_statement: problemStatement.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate questions')
      }

      return data
    } catch (error) {
      console.error('Error generating questions:', error)
      throw error
    }
  },

  /**
   * Check the status of the market research service
   * @returns {Promise<Object>} - Service status information
   */
  async checkServiceStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking service status:', error)
      throw error
    }
  },

  /**
   * Check Ollama status for local LLM availability
   * @returns {Promise<Object>} - Ollama status information
   */
  async checkOllamaStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ollama-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking Ollama status:', error)
      throw error
    }
  },

  /**
   * Generate a market research report using the market research generator
   * @param {string} problemStatement - The business problem statement
   * @param {Array} userAnswers - Array of question-answer pairs (optional)
   * @returns {Promise<Object>} - Generated market research report
   */
  async generateReport(problemStatement, userAnswers = null) {
    try {
      const requestBody = {
        problem_statement: problemStatement
      }
      
      // Only add user_answers if they are provided
      if (userAnswers && Array.isArray(userAnswers) && userAnswers.length > 0) {
        requestBody.user_answers = userAnswers
      }

      const response = await fetch(`${API_BASE_URL}/api/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate report')
      }

      return data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }
}
