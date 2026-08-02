-- ============================================
-- 1. USERS (عام صارفین)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- soft delete
);

-- ============================================
-- 2. ADMINS (منتظمین – اضافی خصوصیات)
-- ============================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE, -- users کی طرف رجوع
    permissions JSON, -- مثلاً {"can_manage_products": true}
    last_login_ip VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 3. PRODUCTS
-- ============================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT, -- admin user id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 4. PRODUCT_VERSIONS
-- ============================================
CREATE TABLE product_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    version VARCHAR(20) NOT NULL,
    release_date DATE,
    changelog TEXT,
    file_path VARCHAR(255), -- ڈاؤن لوڈ فائل کا راستہ
    file_size BIGINT, -- بائٹس میں
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY (product_id, version)
);

-- ============================================
-- 5. ORDERS
-- ============================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    billing_address TEXT,
    coupon_code VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 6. ORDER_ITEMS
-- ============================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_version_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL, -- اس وقت کی قیمت
    total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_version_id) REFERENCES product_versions(id)
);

-- ============================================
-- 7. PAYMENTS
-- ============================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'crypto') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================
-- 8. INVOICES
-- ============================================
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('unpaid', 'paid', 'overdue') DEFAULT 'unpaid',
    pdf_url VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================
-- 9. LICENSES (سافٹ ویئر لائسنس)
-- ============================================
CREATE TABLE licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_item_id INT NOT NULL, -- ہر آئٹم کے لیے ایک لائسنس
    license_key VARCHAR(100) UNIQUE NOT NULL,
    product_version_id INT NOT NULL,
    status ENUM('active', 'inactive', 'expired', 'revoked') DEFAULT 'active',
    expiry_date DATE,
    max_activations INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_version_id) REFERENCES product_versions(id)
);

-- ============================================
-- 10. LICENSE_ACTIVATIONS
-- ============================================
CREATE TABLE license_activations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deactivated_at TIMESTAMP NULL,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

-- ============================================
-- 11. DOWNLOADS (فائل کے میٹا ڈیٹا)
-- ============================================
CREATE TABLE downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_version_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_version_id) REFERENCES product_versions(id) ON DELETE CASCADE
);

-- ============================================
-- 12. DOWNLOAD_LOGS
-- ============================================
CREATE TABLE download_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    download_id INT NOT NULL,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (download_id) REFERENCES downloads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 13. SUPPORT_TICKETS
-- ============================================
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 14. SUPPORT_MESSAGES
-- ============================================
CREATE TABLE support_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_type ENUM('user', 'admin') NOT NULL,
    sender_id INT NOT NULL, -- user_id or admin_id (لیکن ہم user_id ہی استعمال کریں گے)
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 15. REVIEWS
-- ============================================
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, product_id) -- ایک صارف ایک پروڈکٹ کا ایک ہی جائزہ دے سکتا ہے
);

-- ============================================
-- 16. COUPONS
-- ============================================
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    max_uses INT DEFAULT 1,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 17. COUPON_USAGE
-- ============================================
CREATE TABLE coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (coupon_id, order_id) -- ایک آرڈر پر ایک کپن استعمال ہو سکتا ہے
);

-- ============================================
-- 18. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- مثلاً 'order_status', 'promotion'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 19. AFFILIATE_ACCOUNTS
-- ============================================
CREATE TABLE affiliate_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- فیصد
    balance DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 20. AFFILIATE_COMMISSIONS
-- ============================================
CREATE TABLE affiliate_commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    affiliate_account_id INT NOT NULL,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (affiliate_account_id) REFERENCES affiliate_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================
-- 21. LOGIN_SESSIONS
-- ============================================
CREATE TABLE login_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 22. ACTIVITY_LOGS
-- ============================================
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 23. SETTINGS (سسٹم سیٹنگز)
-- ============================================
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES (کارکردگی کے لیے)
-- ============================================
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_version ON order_items(product_version_id);
CREATE INDEX idx_licenses_order_item ON licenses(order_item_id);
CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_license_activations_license ON license_activations(license_id);
CREATE INDEX idx_downloads_product_version ON downloads(product_version_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_order ON coupon_usage(order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_affiliate_commissions_account ON affiliate_commissions(affiliate_account_id);
CREATE INDEX idx_login_sessions_user ON login_sessions(user_id);
CREATE INDEX idx_login_sessions_token ON login_sessions(session_token);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);