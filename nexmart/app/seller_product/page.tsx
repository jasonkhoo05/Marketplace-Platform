'use client';

import React, { useState } from 'react';
import './sellerproduct.css'; 
import { 
  LayoutGrid, 
  Package, 
  ShoppingCart, 
  Settings, 
  Pencil, 
  Trash2, 
  LogOut, 
  Store,
  User
} from 'lucide-react';

export default function SellerPage() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Denim Jacket', category: 'Fashion', price: 99.99, stock: 45, sales: 234, status: 'Available', icon: 'hi' },
    { id: 2, name: 'Cargo Pants', category: 'Fashion', price: 59.99, stock: 23, sales: 156, status: 'Available', icon: 'hii' },
    { id: 3, name: 'T-Shirt', category: 'Fashion', price: 19.99, stock: 67, sales: 189, status: 'Available', icon: 'hiii' },
    { id: 4, name: 'Hoodie', category: 'Fashion', price: 39.99, stock: 0, sales: 98, status: 'Out of Stock', icon: 'hi', isOutOfStock: true },
  ]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">N</span> NexMart
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <LayoutGrid size={18} /> Dashboard
          </div>
          <div className="nav-item">
            <Package size={18} /> Products
          </div>
          <div className="nav-item">
            <ShoppingCart size={18} /> Orders
          </div>
          <div className="nav-item">
            <Settings size={18} /> Settings
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-section">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-details">
              <span className="user-name">Seller Name</span>
              <span className="user-email">seller@shop.com</span>
            </div>
          </div>
          
          <div className="footer-links">
            <button className="footer-action-link">
              <Store size={16} /> Back to Store
            </button>
            <button className="footer-action-link logout">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="header-title">Seller Dashboard</h1>
            <p className="header-subtitle">Manage your product listings for the marketplace.</p>
          </div>
        </header>

        {/* Metric Cards */}
        <section className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Total Products</span>
            <span className="metric-value">{products.length}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label text-green">Available Products</span>
            <span className="metric-value text-green">
              {products.filter((p) => !p.isOutOfStock).length}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label text-red">Out of Stock</span>
            <span className="metric-value text-red">
              {products.filter((p) => p.isOutOfStock).length}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total Sales</span>
            <span className="metric-value">677</span>
          </div>
        </section>

        <div className="products-section-header">
          <div>
            <h2 className="section-title">My Products</h2>
            <p className="section-subtitle">Create, edit and manage product listings.</p>
          </div>
        </div>

        <section className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sales</th>
                <th>Buyer Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className={product.isOutOfStock ? 'row-out-of-stock' : ''}
                >
                  <td>
                    <div className="product-info-cell">
                      <div className="product-thumb">{product.icon}</div>
                      <div>
                        <div className="product-name">{product.name}</div>
                        <small className="product-meta">1 image</small>
                      </div>
                    </div>
                  </td>
                  <td className="product-category">{product.category}</td>
                  <td className="product-price">${product.price.toFixed(2)}</td>
                  <td className={`stock-field ${product.isOutOfStock ? 'text-red' : ''}`}>
                    {product.stock}
                  </td>
                  <td>{product.sales}</td>
                  <td>
                    <span 
                      className={`badge-status ${
                        product.isOutOfStock ? 'badge-danger' : 'badge-success'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-action btn-edit">
                        <Pencil size={14} />
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => setProducts(products.filter(p => p.id !== product.id))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}