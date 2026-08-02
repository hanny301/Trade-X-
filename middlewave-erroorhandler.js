const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Default
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;