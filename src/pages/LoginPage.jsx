import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const [currentStep, setCurrentStep] = useState(1) // 1: username, 2: password, 3: rules.json
  const [wazuhUsername, setWazuhUsername] = useState('')
  const [wazuhPassword, setWazuhPassword] = useState('')
  const [rulesFile, setRulesFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!wazuhUsername.trim()) {
      setError('Wazuh username is required')
      return
    }
    
    setCurrentStep(2)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!wazuhPassword.trim()) {
      setError('Wazuh password is required')
      return
    }
    
    setCurrentStep(3)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    setError('')
    
    if (!file) {
      setRulesFile(null)
      return
    }
    
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please select a valid .json file')
      setRulesFile(null)
      return
    }
    
    // Validate JSON format
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target.result
        JSON.parse(content) // Validate JSON format
        setRulesFile({ file, content })
        setError('')
      } catch (err) {
        setError('Invalid JSON file format')
        setRulesFile(null)
      }
    }
    reader.onerror = () => {
      setError('Error reading file')
      setRulesFile(null)
    }
    reader.readAsText(file)
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!rulesFile) {
      setError('Please select a rules.json file')
      return
    }
    
    setLoading(true)
    
    try {
      // Store the collected data (you might want to use context or localStorage)
      const wazuhConfig = {
        username: wazuhUsername,
        password: wazuhPassword,
        rulesFile: rulesFile.content
      }
      
      // For now, store in localStorage (consider using a more secure method in production)
      localStorage.setItem('wazuhConfig', JSON.stringify(wazuhConfig))
      
      // Navigate to chat page
      navigate('/chat')
    } catch (err) {
      setError('Failed to initialize Wazuh configuration')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setError('')
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleUsernameSubmit} className="rounded-2xl px-0 pt-0 pb-0 mb-0">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Wazuh Setup
            </h1>
            <p className="text-white/60 text-sm mb-8 text-center">
              Step 1 of 3: Enter your Wazuh username
            </p>
            
            <div className="mb-8">
              <label 
                className="block text-white/80 text-sm font-medium mb-2" 
                htmlFor="wazuh-username"
              >
                Wazuh Username
              </label>
              <input
                className="appearance-none border border-white/30 rounded-2xl w-full py-3 px-4 text-white bg-black leading-tight focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-white/40 shadow-md"
                id="wazuh-username"
                type="text"
                placeholder="Enter your Wazuh username"
                value={wazuhUsername}
                onChange={(e) => setWazuhUsername(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-center">
              <button
                className="bg-white hover:bg-white/90 text-black font-medium py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-150 w-full shadow-md"
                type="submit"
              >
                Next
              </button>
            </div>
          </form>
        )
      
      case 2:
        return (
          <form onSubmit={handlePasswordSubmit} className="rounded-2xl px-0 pt-0 pb-0 mb-0">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Wazuh Setup
            </h1>
            <p className="text-white/60 text-sm mb-8 text-center">
              Step 2 of 3: Enter your Wazuh password
            </p>
            
            <div className="mb-8">
              <label 
                className="block text-white/80 text-sm font-medium mb-2" 
                htmlFor="wazuh-password"
              >
                Wazuh Password
              </label>
              <input
                className="appearance-none border border-white/30 rounded-2xl w-full py-3 px-4 text-white bg-black leading-tight focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-white/40 shadow-md"
                id="wazuh-password"
                type="password"
                placeholder="Enter your Wazuh password"
                value={wazuhPassword}
                onChange={(e) => setWazuhPassword(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={goBack}
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-medium py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-150 flex-1"
              >
                Back
              </button>
              <button
                className="bg-white hover:bg-white/90 text-black font-medium py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-150 flex-1 shadow-md"
                type="submit"
              >
                Next
              </button>
            </div>
          </form>
        )
      
      case 3:
        return (
          <form onSubmit={handleFinalSubmit} className="rounded-2xl px-0 pt-0 pb-0 mb-0">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Wazuh Setup
            </h1>
            <p className="text-white/60 text-sm mb-8 text-center">
              Step 3 of 3: Select your rules.json file
            </p>
            
            <div className="mb-8">
              <label 
                className="block text-white/80 text-sm font-medium mb-2" 
                htmlFor="rules-file"
              >
                Rules Configuration File
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="rules-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                />
                <div className="appearance-none border border-white/30 rounded-2xl w-full py-3 px-4 text-white bg-black leading-tight focus-within:ring-2 focus-within:ring-white focus-within:border-white shadow-md cursor-pointer hover:bg-white/5 transition-colors">
                  {rulesFile ? (
                    <span className="text-green-400">✓ {rulesFile.file.name}</span>
                  ) : (
                    <span className="text-white/40">Click to select rules.json file</span>
                  )}
                </div>
              </div>
              <p className="text-white/40 text-xs mt-2">
                Select a JSON file containing your Wazuh filter rules
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={goBack}
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-medium py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-150 flex-1"
              >
                Back
              </button>
              <button
                className="bg-white hover:bg-white/90 text-black font-medium py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-150 flex-1 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || !rulesFile}
              >
                {loading ? 'Setting up...' : 'Start Chat'}
              </button>
            </div>
          </form>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md px-6">
        {renderStep()}
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage
