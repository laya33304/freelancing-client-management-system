INSERT OR IGNORE INTO users
(id, name, email, password, role)
VALUES
(1, 'Demo Freelancer', 'freelancer@example.com', 'demo123', 'freelancer'),

(2, 'Demo Client', 'client@example.com', 'demo123', 'client'),

(3, 'Demo Admin', 'admin@example.com', 'demo123', 'admin');


INSERT OR IGNORE INTO clients
(id, user_id, name, email, phone, company, address)
VALUES
(
    1,
    2,
    'John Smith',
    'client@example.com',
    '9876543210',
    'ABC Technologies',
    'Hyderabad'
);


INSERT OR IGNORE INTO projects
(
    id,
    client_id,
    freelancer_id,
    title,
    description,
    budget,
    deadline,
    status
)
VALUES
(
    1,
    1,
    1,
    'E-commerce Website',
    'Build a complete e-commerce website',
    80000,
    '2026-10-30',
    'active'
);


INSERT OR IGNORE INTO tasks
(
    id,
    project_id,
    title,
    description,
    status,
    priority,
    due_date
)
VALUES
(
    1,
    1,
    'Design Homepage',
    'Create homepage UI design',
    'Completed',
    'High',
    '2026-10-05'
),

(
    2,
    1,
    'Build Backend API',
    'Develop Node.js and Express APIs',
    'In Progress',
    'High',
    '2026-10-15'
),

(
    3,
    1,
    'Build React Frontend',
    'Develop frontend pages',
    'To Do',
    'Medium',
    '2026-10-25'
);


INSERT OR IGNORE INTO invoices
(
    id,
    project_id,
    invoice_number,
    amount,
    status,
    issue_date,
    due_date
)
VALUES
(
    1,
    1,
    'INV-2026-0001',
    80000,
    'Partially Paid',
    '2026-10-01',
    '2026-10-15'
);


INSERT OR IGNORE INTO payments
(
    id,
    invoice_id,
    amount,
    payment_date
)
VALUES
(
    1,
    1,
    30000,
    '2026-10-05'
);


INSERT OR IGNORE INTO attachments
(
    id,
    project_id,
    name,
    url
)
VALUES
(
    1,
    1,
    'Project Design',
    'https://example.com/project-design'
);


INSERT OR IGNORE INTO project_history
(
    id,
    project_id,
    action,
    description
)
VALUES
(
    1,
    1,
    'PROJECT_CREATED',
    'E-commerce Website project created'
),

(
    2,
    1,
    'TASK_CREATED',
    'Design Homepage task created'
),

(
    3,
    1,
    'TASK_STATUS_CHANGED',
    'Design Homepage marked as Completed'
),

(
    4,
    1,
    'INVOICE_CREATED',
    'Invoice INV-2026-0001 created'
),

(
    5,
    1,
    'PAYMENT_RECEIVED',
    'Payment of 30000 received'
);