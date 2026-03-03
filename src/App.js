import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection (multiple images)
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Validate all files
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please select valid image files');
      return;
    }

    setSelectedImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    setResults(null);
    setError(null);
  };

  // Handle gender classification
  const handleClassify = async () => {
    if (selectedImages.length === 0) {
      setError('Please select images first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send multiple images to backend API
      const formData = new FormData();
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch('https://gender-classification-x2xe.onrender.com', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to classify images');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results);
      
    } catch (err) {
      setError('Failed to classify images. Please try again.');
      console.error('Classification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setSelectedImages([]);
    setPreviewUrls([]);
    setResults(null);
    setError(null);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>Gender Classification</h1>
          <p>Upload multiple images to classify gender</p>
        </header>

        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              onChange={handleImageSelect}
              className="file-input"
              multiple
            />
            <label htmlFor="imageInput" className="file-label">
              <span className="upload-icon">📁</span>
              <span>Choose Images</span>
            </label>
          </div>
          {selectedImages.length > 0 && (
            <p className="file-count">{selectedImages.length} image(s) selected</p>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {previewUrls.length > 0 && (
          <div className="preview-section">
            <h3>Image Previews</h3>
            <div className="image-grid">
              {previewUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="preview-image"
                  />
                  {selectedImages[index] && (
                    <span className="image-name">{selectedImages[index].name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {results && (
          <div className="result-section">
            <h3>Classification Results</h3>
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className={`result-card ${result.gender ? result.gender.toLowerCase() : 'error'}`}>
                  <div className="result-info">
                    <span className="result-icon">
                      {result.gender === 'Male' ? '👨' : result.gender === 'Female' ? '👩' : '❌'}
                    </span>
                    <div className="result-details">
                      <span className="result-text">
                        {result.gender || result.error}
                      </span>
                      {result.confidence && (
                        <span className="confidence-score">
                          Confidence: {result.confidence}%
                        </span>
                      )}
                      {result.filename && (
                        <span className="result-filename">{result.filename}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="action-buttons">
          {previewUrls.length > 0 && !results && (
            <>
              <button 
                className="btn btn-primary"
                onClick={handleClassify}
                disabled={loading}
              >
                {loading ? 'Classifying...' : 'Classify All Images'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </button>
            </>
          )}
          
          {results && (
            <button 
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Try More Images
            </button>
          )}
        </div>

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Analyzing images...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

