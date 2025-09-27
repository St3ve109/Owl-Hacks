#!/usr/bin/env python3
"""
Flask web application to display MLB live scores
"""

from flask import Flask, render_template, jsonify
from mlb_scores import MLBScoresFetcher
import json

app = Flask(__name__)

@app.route('/')
def index():
    """Main page with MLB scores"""
    return render_template('index.html')

@app.route('/api/mlb-scores')
def get_mlb_scores():
    """API endpoint to get MLB scores"""
    try:
        fetcher = MLBScoresFetcher()
        scores_data = fetcher.get_live_scores()
        return jsonify(scores_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mlb-scores/refresh')
def refresh_mlb_scores():
    """API endpoint to refresh MLB scores"""
    try:
        fetcher = MLBScoresFetcher()
        scores_data = fetcher.get_live_scores()
        
        # Save to file for backup
        fetcher.save_to_file(scores_data)
        
        return jsonify(scores_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
