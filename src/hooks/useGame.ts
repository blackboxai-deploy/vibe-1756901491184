"use client";

import { useEffect, useRef, useState } from 'react';
import { GameEngine, GameState } from '../lib/gameEngine';

export const useGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new GameEngine(canvas);
    gameEngineRef.current = engine;

    // Set initial high score
    setHighScore(engine.highScore);

    // Start game loop
    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  // Update React state when game state changes
  useEffect(() => {
    if (!gameEngineRef.current) return;

    const engine = gameEngineRef.current;
    
    const updateGameState = () => {
      setGameState(engine.gameState);
      setScore(engine.score);
      setHighScore(engine.highScore);
    };

    // Poll game state (alternative to event system)
    const interval = setInterval(updateGameState, 100);

    return () => clearInterval(interval);
  }, []);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !gameEngineRef.current) return;

      const container = canvasRef.current.parentElement;
      if (!container) return;

      const { clientWidth, clientHeight } = container;
      const aspectRatio = 16 / 9;
      
      let canvasWidth = clientWidth;
      let canvasHeight = clientWidth / aspectRatio;

      if (canvasHeight > clientHeight) {
        canvasHeight = clientHeight;
        canvasWidth = clientHeight * aspectRatio;
      }

      canvasRef.current.width = canvasWidth;
      canvasRef.current.height = canvasHeight;
      canvasRef.current.style.width = `${canvasWidth}px`;
      canvasRef.current.style.height = `${canvasHeight}px`;

      gameEngineRef.current.resize(canvasWidth, canvasHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const resetGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetGame();
    }
  };

  const pauseGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
    }
  };

  const resumeGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
    }
  };

  return {
    canvasRef,
    gameState,
    score,
    highScore,
    resetGame,
    pauseGame,
    resumeGame
  };
};