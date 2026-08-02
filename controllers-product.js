const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, type, features, downloadLink } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      type,
      features: features ? features.split(',').map(f => f.trim()) : [],
      downloadLink,
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const { name, description, price, type, features, downloadLink, isActive } = req.body;
    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price || product.price;
    product.type = type || product.type;
    product.features = features ? features.split(',').map(f => f.trim()) : product.features;
    product.downloadLink = downloadLink || product.downloadLink;
    if (isActive !== undefined) product.isActive = isActive;
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };