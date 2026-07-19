
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        <p className="font-mono">AI Escape Room Challenge &copy; {new Date().getFullYear()}</p>
        <p className="text-xs mt-1">
          Featuring Sudoku Solver, BFS Pathfinder, Connect Four Minimax, and STRIPS Planner
        </p>
      </div>
    </footer>
  );
};

export default Footer;
