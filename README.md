# 📅 መገናኛ · Megenagna

**The Meeting Place for Ethiopian Teams**

A beautiful and modern team scheduling application built with Next.js, featuring native Ethiopian calendar support. Megenagna (መገናኛ - "meeting place") helps Ethiopian teams coordinate meetings and find times that work for everyone!

## ✨ Features

- 🇪🇹 **Native Ethiopian Calendar** - Full support for the Ethiopian calendar with Ge'ez numerals and month names
- 🌐 **Dual Calendar Display** - Shows both Ethiopian and Gregorian dates for easy reference
- 👥 **Team Collaboration** - Multiple participants can mark their availability
- 📊 **Visual Availability Grid** - Heat map showing overlapping free times
- 🎨 **Beautiful Ethiopic Design** - Authentic Ethiopian branding with traditional patterns
- ⚡ **Two Modes**:
  - **Create Meeting**: Set up a poll and share with your team
  - **Quick Schedule**: Fast in-person scheduling for small teams
- 🎯 **Drag & Drop Interface** - Intuitive time slot selection
- 📱 **Responsive Design** - Works great on desktop and mobile

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Calendarr
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Fonts**: Noto Sans Ethiopic (Google Fonts)

## 📖 How It Works

### Create Meeting Mode

1. **Create** - Set up your meeting with date ranges and time slots
2. **Share** - Send the generated link to your team members
3. **Mark** - Each person marks when they're available
4. **Decide** - See which times work best for everyone with the heat map

### Quick Schedule Mode

Perfect for in-person coordination where team members are together:
1. Name your event
2. Select dates from the Ethiopian calendar
3. Set your time range
4. Each person adds their name and marks availability
5. See overlapping times instantly

## 📅 Ethiopian Calendar

The app fully supports the Ethiopian calendar system:
- **13 Months**: 12 months of 30 days + Pagume (5-6 days)
- **Ge'ez Numerals**: ፩, ፪, ፫, ፬, ፭, etc.
- **Ethiopic Month Names**: መስከረም, ጥቅምት, ኅዳር, etc.
- **Automatic Conversion**: Seamlessly converts between Ethiopian and Gregorian calendars

## 🎯 Usage

### Creating a Meeting

1. Click "አዲስ ስብሰባ (Create New Meeting)" on the home page
2. Fill in meeting details:
   - Meeting title
   - Your name
   - Description (optional)
   - Date range
   - Time range
3. Click "Create Meeting"
4. Share the generated link with team members

### Quick Scheduling

1. Click "ፈጣን መርሃግብር (Quick Schedule)" on the home page
2. Name your event (optional)
3. Select time range for scheduling
4. Pick dates from the Ethiopian calendar
5. Add participants and mark availability
6. View the color-coded availability grid

## 🎨 Color Legend

- **Dark Green** 🟢 - Everyone is available
- **Light Green** - Most people available
- **Yellow** 🟡 - Some people available
- **Orange** 🟠 - Few people available
- **Gray** - No responses yet

## 🌍 Localization

The app features bilingual interface:
- Ethiopic (Amharic script)
- English

All calendar elements use authentic Ethiopic text with English translations for accessibility.

## 📝 License

MIT License - feel free to use this for your team!

## 🙏 Acknowledgments

- Ethiopian calendar conversion algorithms
- Noto Sans Ethiopic font family
- The Ethiopian developer community

## 💡 Future Enhancements

- [ ] Export to iCal/Google Calendar
- [ ] Email notifications
- [ ] Multiple time zone support
- [ ] Dark mode
- [ ] Meeting notes and attachments
- [ ] Recurring meetings

---

**ለመልካም ስብሰባ እና ትብብር!** 
*For Great Meetings and Collaboration!*

Made with ❤️ for Ethiopian teams worldwide 🇪🇹
