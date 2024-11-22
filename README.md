# Modern Budget Tracker

A sleek, responsive web application for personal finance management. Track your income and expenses with beautiful visualizations and detailed transaction history.

![Budget Tracker](screenshots/preview.png) *(Screenshot will need to be added)*

## Features

### 1. Transaction Management
- Add income and expense transactions
- Categorized entries with optional descriptions
- Date tracking for each transaction
- Real-time balance updates
- Collapsible transaction history

### 2. Smart Categorization
#### Income Categories:
- Salary/Wages
- Overtime Pay
- Bonuses
- Commissions
- Tips
- Stock Options
- Dividends
- Interest Income
- Freelance Payments

#### Expense Categories:
- Rent/Mortgage
- Utilities
- Internet and Phone Bills
- Groceries
- Transportation
- Insurance
- Healthcare
- Childcare/Education
- Debt Repayments
- Entertainment
- Clothing and Personal Items
- Savings and Investments
- Household Maintenance
- Subscriptions
- Taxes
- Gym Memberships
- Charitable Donations
- Travel and Vacations
- Pet Care
- Miscellaneous

### 3. Visual Analytics
- Real-time chart updates as you enter transactions
- Doughnut chart showing income vs expenses distribution
- 6-month trend line chart
- Interactive and responsive visualizations

### 4. User Experience
- Clean, modern interface
- Mobile-responsive design
- Real-time updates
- Collapsible transaction history
- Smooth animations
- Persistent data storage

## Technical Details

### Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js (v3.9.1)
- Local Storage for data persistence

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Open `index.html` in your preferred browser

   OR

   Use a local development server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js
   npx http-server
   ```

3. Start tracking your finances!

## Usage Guide

1. **Adding Transactions**
   - Select transaction type (Income/Expense)
   - Choose a category
   - Add optional description
   - Select date
   - Enter amount
   - Click "Add Transaction"

2. **Viewing History**
   - Use the toggle button (▼) to show/hide transaction history
   - Scroll through past transactions
   - Delete transactions by clicking the × button

3. **Reading Charts**
   - Doughnut chart shows the balance between income and expenses
   - Line chart displays 6-month financial trends
   - Charts update in real-time as you enter new transactions

## Data Privacy

All data is stored locally in your browser using localStorage. No data is sent to any external servers.

## Future Enhancements

- Export/Import functionality
- Multiple currency support
- Budget goals and alerts
- Recurring transactions
- Cloud sync capabilities
- Advanced filtering and sorting
- Custom categories
- Dark mode

## Contributing

Feel free to fork this project and submit pull requests. You can also open issues for bugs or feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ using vanilla JavaScript
