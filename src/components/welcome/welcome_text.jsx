/* eslint-disable @stylistic/jsx-one-expression-per-line */
// welcome_text.jsx

// styled by chatGPT, unaware of style.scss. I might style it more later
import React from 'react';

const WelcomeText = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dartmouth College Memory Study</h1>
      <h2 style={styles.subtitle}>An Interactive Online Test, for 2 Newly Proposed Traits</h2>
      <h3 style={styles.traits}>(Order-Linking & Similarity-Linking)</h3>
      <p style={styles.byline}>by Luke Hafermann, for the Quantitative Social Sciences major<br />(an undergraduate Honors Thesis in QSS)</p>
      <p style={styles.supervision}>Under the Supervision of Arjen Stolk, PhD;<br />Department of Psychological and Brain Sciences</p>
      <p style={styles.invitation}><b>You are invited to participate in a research study!</b><br /><br />Website is in beta testing phase, during week 7. Planning to open to all participants week 8 Winter Term.</p>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    margin: '20px',
    padding: '20px',
    border: '2px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#34495e',
    marginBottom: '5px',
  },
  traits: {
    fontSize: '1.2rem',
    fontStyle: 'italic',
    color: '#7f8c8d',
    marginBottom: '15px',
  },
  byline: {
    fontSize: '1rem',
    color: '#34495e',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  supervision: {
    fontSize: '1rem',
    color: '#34495e',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  invitation: {
    fontSize: '1.2rem',
    color: '#e74c3c',
    fontWeight: 'bold',
  },
};

export default WelcomeText;
