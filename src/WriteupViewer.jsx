import React, { useState, useEffect } from 'react';

const WriteupViewer = ({ writeupPath, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (writeupPath) {
      setLoading(true);
      fetch(writeupPath)
        .then(response => response.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading writeup:', error);
          setContent('# Error\n\nCould not load writeup.');
          setLoading(false);
        });
    }
  }, [writeupPath]);

  // Simple markdown parser for basic formatting
  const parseMarkdown = (md) => {
    if (!md) return '';
    
    let html = md;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-900 bg-opacity-80 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700"><code class="text-cyan-400 text-sm">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 bg-opacity-60 px-2 py-1 rounded text-cyan-400 text-sm">$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mb-6">$1</h1>');
    
    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full rounded-lg my-4 border border-gray-700" />');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="border-gray-700 my-6">');
    
    // Lists
    html = html.replace(/^\d+\.\s+(.*)$/gm, '<li class="ml-6 mb-2 text-gray-300 text-sm">$1</li>');
    html = html.replace(/^[-*]\s+(.*)$/gm, '<li class="ml-6 mb-2 text-gray-300 list-disc text-sm">$1</li>');
    
    // Paragraphs
    html = html.split('\n\n').map(para => {
      if (para.startsWith('<') || para.trim() === '') return para;
      return `<p class="text-gray-300 mb-4 leading-relaxed text-sm">${para}</p>`;
    }).join('\n');
    
    return html;
  };

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      ></div>
      
      {/* Modal - Half Screen */}
      <div className="fixed right-0 top-0 h-full w-full md:w-1/2 animate-slideLeft">
        <div className="relative bg-black bg-opacity-90 backdrop-blur-md border-l border-gray-700 h-full overflow-y-auto custom-scrollbar">
          {/* Close button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right bg-gray-800 bg-opacity-80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors z-10 text-sm"
          >
            ✕ Close
          </button>
          
          {/* Content */}
          <div className="p-6 pt-16">
            {loading ? (
              <div className="text-center text-gray-400 font-bold text-sm">Loading writeup...</div>
            ) : (
              <div 
                className="writeup-content text-sm"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteupViewer;