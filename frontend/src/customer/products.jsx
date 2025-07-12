import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../utils/auth';


// Utility to get geolocation for customer
const getLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
};

const getDiscountedPrice = (price, discount) => (price * (1 - discount)).toFixed(2);

const Products = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [products, setProducts] = useState([]);
  const user = getCurrentUser();
  const role = user?.role || 'customer';


  useEffect(() => {
      const fetchProducts = async () => {
        console.log(role,"role")

      try {
        let url = "";
        
        if (role === "customer") {
          const pos = await getLocation();
          url = `http://localhost:5000/api/customer/products?lat=${pos.lat}&lng=${pos.lng}`;
        }
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        

        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, [role]);

  const filteredProducts = products.filter(product =>
    filterStatus === 'all' ? true : product.status === filterStatus
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'fresh': return 'bg-green-100 text-green-800';
      case 'near-expiry': return 'bg-yellow-100 text-yellow-800';
      case 'expiring-soon': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-6 sm:p-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
          Our Sustainable Products
        </h2>

        {/* Filter Section */}
        <div className="mb-8 flex justify-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white appearance-none pr-8 text-gray-700 font-medium"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3e%3c/path%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.5em 1.5em',
            }}
          >
            <option value="all">All Products</option>
            <option value="fresh">Fresh</option>
            <option value="near-expiry">Near Expiry</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center p-10 bg-yellow-50 rounded-lg border border-yellow-200 shadow-md">
            <p className="text-xl font-semibold text-yellow-700 mb-2">No Products Found</p>
            <p className="text-md text-gray-600">Try adjusting your filter settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 relative overflow-hidden">
                {/* Status Badge */}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(product.status)}`}>
                  {product.status.replace('-', ' ')}
                </span>

                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-28 h-28 object-cover rounded-md mb-4 border border-gray-200 mt-8"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = `https://placehold.co/100x100/cccccc/000000?text=${product.name.split(' ').map(n => n[0]).join('')}`;
                  }}
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Expires: {product.expiryDate}</p>
                <p className="text-sm text-gray-600 mb-2">Stock: {product.stockQuantity}</p>
                <p className="text-sm text-gray-600 mb-2">storeid: {product.storeId}</p>
                {product.currentDiscount > 0 ? (
                  <div className="flex flex-col items-center space-y-1 mt-2">
                    <span className="text-gray-400 line-through text-sm">${product.price.toFixed(2)}</span>
                    <span className="text-red-600 font-bold text-2xl">${getDiscountedPrice(product.price, product.currentDiscount)}</span>
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {(product.currentDiscount * 100).toFixed(0)}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-800 font-bold text-2xl mt-2">${product.price.toFixed(2)}</span>
                )}
                <button className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-200 transform hover:scale-105">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
