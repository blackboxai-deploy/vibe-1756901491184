"use client";

import React from 'react';
import { useGame } from '../hooks/useGame';
import { GameState } from '../lib/gameEngine';

const FlappyBird: React.FC = () => {
  const { canvasRef, gameState, score, highScore } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="flex flex-col items-center space-y-4 max-w-4xl w-full">
        {/* Game Title */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            🐦 Flappy Bird
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mt-2">
            Classic arcade game reimagined for the web
          </p>
        </div>

        {/* Game Canvas Container */}
        <div className="relative bg-black rounded-lg shadow-2xl overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block max-w-full max-h-full"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Loading overlay (shown before canvas is ready) */}
          {!canvasRef.current && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-xl">Loading game...</div>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-md space-y-2 sm:space-y-0 sm:space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-sm text-blue-100">Current Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">{highScore}</div>
            <div className="text-sm text-blue-100">Best Score</div>
          </div>
        </div>

        {/* Controls Info */}
        <div className="text-center text-blue-100 space-y-2 max-w-md">
          <div className="text-lg font-semibold">How to Play</div>
          <div className="text-sm space-y-1">
            <div>🖱️ <strong>Click</strong> to flap</div>
            <div>📱 <strong>Touch</strong> to flap (mobile)</div>
            <div>⌨️ <strong>Space</strong> to flap (keyboard)</div>
          </div>
          
          {gameState === GameState.WAITING && (
            <div className="mt-4 p-3 bg-blue-500/30 rounded-lg border border-blue-300/30">
              <div className="text-white font-semibold">Ready to Play!</div>
              <div className="text-sm text-blue-100">
                Navigate through the pipes without hitting them or the ground
              </div>
            </div>
          )}

          {gameState === GameState.PLAYING && (
            <div className="mt-4 p-3 bg-green-500/30 rounded-lg border border-green-300/30">
              <div className="text-white font-semibold">🎮 Game Active</div>
              <div className="text-sm text-blue-100">
                Keep flapping to stay airborne!
              </div>
            </div>
          )}

          {gameState === GameState.GAME_OVER && (
            <div className="mt-4 p-3 bg-red-500/30 rounded-lg border border-red-300/30">
              <div className="text-white font-semibold">💥 Game Over</div>
              <div className="text-sm text-blue-100">
                {score === highScore && score > 0 ? '🎉 New High Score!' : 'Try again to beat your best!'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-blue-200 text-sm mt-8 space-y-1">
          <div>Built with React, TypeScript, and HTML5 Canvas</div>
          <div>Responsive design for desktop and mobile</div>
        </footer>
      </div>
    </div>
  );
};

export default FlappyBird;