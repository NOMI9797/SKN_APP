# SKN - Digital Network Marketing System

A professional digital network marketing platform built with Next.js and Appwrite, designed to help users earn money from home through referrals and network building.

## 🚀 Features

- **User Authentication**: Secure login/registration system
- **Referral System**: Binary tree structure with left/right placement
- **Earnings Calculator**: Automatic pair completion tracking
- **Star Level Rewards**: Progressive reward system based on network growth
- **Professional UI**: Modern, responsive design with Tailwind CSS
- **Real-time Updates**: Live dashboard with current statistics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (Database, Authentication, Storage)
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Appwrite account and project

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd skn-webapp
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=skn_database

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Appwrite Setup

1. Create a new Appwrite project
2. Set up the following collections:
   - `users` - User profiles and network data
   - `referrals` - Referral relationships
   - `transactions` - Earnings and payments
   - `payments` - Payment verification

3. Configure authentication settings
4. Set up storage buckets for profile images

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # User dashboard
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── appwrite.ts       # Appwrite configuration
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🔐 Authentication Flow

1. **Registration**: Users sign up with email, password, and optional referral code
2. **Login**: Secure authentication using Appwrite
3. **Session Management**: Automatic session handling and user state
4. **Protected Routes**: Dashboard access requires authentication

## 💰 Business Logic

### Referral System
- Each user must refer 2 people (left + right)
- Binary tree structure for network growth
- Automatic pair completion detection

### Earnings Structure
- **First Pair**: 400 PKR (200 + 200)
- **2nd-99th Pair**: 200 PKR per pair
- **100th+ Pair**: 100 PKR per pair

### Star Level Rewards
- **Level 1**: 10/10 pairs → 500 PKR
- **Level 2**: 30/30 pairs → 1,500 PKR
- **Level 3**: 100/100 pairs → 3,000 PKR
- And many more levels with increasing rewards

## 🎨 UI Components

- **Responsive Design**: Mobile-first approach
- **Modern Interface**: Clean, professional appearance
- **Interactive Elements**: Hover effects and transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks (if configured)

## 📱 Responsive Design

- **Mobile**: Optimized for small screens
- **Tablet**: Adaptive layout for medium screens
- **Desktop**: Full-featured interface for large screens

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms

- Netlify
- AWS Amplify
- DigitalOcean App Platform

## 🔒 Security Features

- Secure authentication with Appwrite
- Protected API routes
- Input validation and sanitization
- CSRF protection
- Secure session management

## 📊 Performance

- Next.js optimization
- Image optimization
- Code splitting
- Lazy loading
- SEO optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Admin panel for system management
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Advanced referral tracking
- [ ] Social media integration

---

**Built with ❤️ for the SKN community**
