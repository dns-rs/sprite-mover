"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function SpriteSheetAnimator() {
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(10);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // State variables for customizable dimensions
  const [frameCount, setFrameCount] = useState(10);
  const [frameWidth, setFrameWidth] = useState(567);
  const [frameHeight, setFrameHeight] = useState(567);
  
  // Mount check
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
      processImage(file);
    }
  };

  // Handle file selection
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  // Process uploaded image
  const processImage = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const expectedWidth = frameWidth * frameCount;
        const expectedHeight = frameHeight;
        
        if (img.width !== expectedWidth || img.height !== expectedHeight) {
          alert(`Image must be ${expectedWidth}x${expectedHeight}px (${frameCount} frames of ${frameWidth}x${frameHeight}px each)`);
          return;
        }
        extractFrames(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Extract frames from sprite sheet
  const extractFrames = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const extractedFrames: string[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      ctx.clearRect(0, 0, frameWidth, frameHeight);
      // Extract frames horizontally
      ctx.drawImage(img, i * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
      extractedFrames.push(canvas.toDataURL());
    }
    
    setFrames(extractedFrames);
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  // Animation loop 
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const interval = 1000 / fps;
      let lastTime = 0;
      
      const animate = (time: number) => {
        if (time - lastTime > interval) {
          setCurrentFrame(prev => (prev + 1) % frames.length);
          lastTime = time;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, frames, fps]);

  // Reset state 
  const reset = () => {
    setFrames([]);
    setCurrentFrame(0);
    setIsPlaying(false);
    setFileName('');
  };

  // Drag events 
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Only render the full component after it's mounted on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-400">Sprite Mover</h1>
          </header>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-400">Sprite Mover</h1>
        </header>
        
        {/* Settings Panel */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Sprite Sheet Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Frame Count</label>
              <input 
                type="number" 
                min="1" 
                max="30" 
                value={frameCount} 
                onChange={(e) => setFrameCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Frame Width (px)</label>
              <input 
                type="number" 
                min="16" 
                max="2048" 
                value={frameWidth} 
                onChange={(e) => setFrameWidth(parseInt(e.target.value) || 16)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Frame Height (px)</label>
              <input 
                type="number" 
                min="16" 
                max="2048" 
                value={frameHeight} 
                onChange={(e) => setFrameHeight(parseInt(e.target.value) || 16)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-400">
              Expected sprite sheet dimensions: <span className="text-white font-mono">{frameWidth * frameCount}x{frameHeight}px</span>
            </p>
          </div>
        </div>
        
        <div 
          className={`border-2 rounded-xl p-8 mb-8 transition-all duration-300 ${
            isDragging 
              ? 'border-blue-500 bg-blue-900/20' 
              : 'border-dashed border-gray-600 bg-gray-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {frames.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <h3 className="mt-4 text-xl font-medium text-gray-200">Drag & drop your sprite sheet</h3>
                <p className="mt-2 text-gray-400">{frameWidth * frameCount}x{frameHeight}px image with {frameCount} frames ({frameWidth}x{frameHeight}px each)</p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800 text-gray-400">or</span>
                </div>
              </div>
              
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                Browse Files
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-lg border border-gray-700 mb-6">
                {frames.length > 0 && (
                  <img 
                    src={frames[currentFrame]} 
                    alt="Sprite frame" 
                    className="w-[300px] h-[300px] object-contain"
                    style={{ imageRendering: 'auto' }}
                  />
                )}
              </div>
              
              <div className="w-full max-w-md space-y-6">
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pause
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Play
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={reset}
                    className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-300">Animation Speed: {fps} FPS</label>
                    <span className="text-sm text-gray-400">
                      {frames.length > 0 ? `${Math.round(1000/fps)}ms/frame` : ''}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={fps} 
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <div>
                    <p className="text-gray-300">Frame: {currentFrame + 1}/{frames.length}</p>
                    <p className="text-sm text-gray-400 truncate max-w-[200px]">{fileName}</p>
                  </div>
                  
                  <div className="flex space-x-1">
                    {frames.map((_, index) => (
                      <div 
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentFrame ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Working with {frameWidth}x{frameHeight} Frames</h2>
          <ol className="space-y-3 list-decimal list-inside text-gray-300">
            <li>Create each animation frame at {frameWidth}x{frameHeight} pixels</li>
            <li>Arrange frames horizontally in a {frameWidth * frameCount}x{frameHeight}px sprite sheet</li>
            <li>Preview your animation with adjustable playback speed</li>
            <li>In Godot: Import as Texture, then use in AnimatedSprite node</li>
            <li>In Godot: Set H-frames to {frameCount}, V-frames to 1</li>
            <li>Use linear filtering for smooth scaling in-game</li>
          </ol>                    
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}