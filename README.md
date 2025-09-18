# Implied Volatility Surface Construction Terminal

### 🚀 Features

#### Core Functionality
- **Real-time Market Data:** Fetches options data for various symbols (SPY, QQQ, AAPL, etc.).
- **3D Volatility Surface:** Interactive 3D surface plots with customizable color schemes.
- **2D Slice Analysis:** Volatility smile and term structure visualizations.
- **Multiple Interpolation Methods:** Cubic, linear, and spline interpolation.
- **Surface Smoothing:** Configurable smoothing parameters for noise reduction.

#### User Interface
- **Resizable Panels:** Drag-to-resize left and right panels.
- **Real-time Updates:** Live market data with connection status indicators.
- **Export Capabilities:** PNG export for surfaces and data export functionality.
- **Interactive Controls:** Camera angles, color schemes, and view modes.

#### Technical Features
- **Python Backend:** Black-Scholes pricing with numerical Greeks calculation.
- **React Frontend:** Modern component-based architecture with styled-components.
- **Plotly Integration:** High-performance 3D plotting and visualization.
- **Responsive Design:** Adaptive layout for different screen sizes.

---

### 📋 Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **pnpm** (recommended) or `npm`

---

### 🛠️ Installation

1.  **Clone the Repository**

    ```bash
    git clone <repository-url>
    cd implied-volatility-surface
    ```

2.  **Install Frontend Dependencies**

    ```bash
    # Using pnpm (recommended)
    pnpm install

    # Or using npm
    npm install
    ```

3.  **Install Python Dependencies**

    ```bash
    pip install numpy pandas scipy plotly yfinance flask flask-cors
    ```

---

### 🏃‍♂️ Running the Application

1.  **Start the Frontend (React)**

    ```bash
    # Using pnpm
    pnpm start

    # Or using npm
    npm start
    ```
    The frontend will be available at `http://localhost:3000`

2.  **Start the Backend (Python)**

    ```bash
    python main.py
    ```

---

### 🎮 Usage Guide

1.  **Symbol Selection**
    Use the search bar in the header to select different symbols (SPY, QQQ, AAPL, etc.). The application will automatically fetch options data for the selected symbol.

2.  **Building Surfaces**
    -   **Load Market Data:** Click "Refresh Data" to fetch the latest options chain.
    -   **Configure Parameters:** Adjust interpolation method, smoothing, and other settings in the control panel.
    -   **Build Surface:** Click "Build Surface" to construct the volatility surface.
    -   **Analyze Results:** View the 3D surface and examine 2D slices for detailed analysis.

3.  **Visualization Options**
    -   **3D Surface:** Interactive 3D plot with rotation, zoom, and pan capabilities.
    -   **2D Slices:** Toggle between volatility smile and term structure views.
    -   **Color Schemes:** Choose from Viridis, Plasma, Hot, Cool, Jet, Rainbow, or Turbo.
    -   **Camera Angles:** Switch between perspective, front, side, and top views.

4.  **Export and Analysis**
    -   **Image Export:** Save high-resolution PNG images of surfaces.
    -   **Data Export:** Export underlying data for external analysis.
    -   **Metrics Display:** View real-time statistics including average volatility, skew, and ranges.

---

### ⚙️ Configuration Options

#### Surface Parameters
-   **Interpolation Method:** `cubic`, `linear`, `spline`
-   **Smoothing Factor:** 0-100% for noise reduction
-   **Color Scheme:** Various built-in color maps
-   **Contour Lines:** Toggle surface contour projections
-   **Camera Position:** Predefined viewing angles

#### Display Settings
-   **View Mode:** 3D surface or 2D slice analysis
-   **Slice Type:** Volatility smile or term structure
-   **Panel Sizes:** Resizable left and right panels
-   **Real-time Updates:** Configurable refresh intervals

---

### 🏗️ Architecture

-   **Frontend (React):** `styled-components`, `Plotly.js`, modular component architecture, and React hooks for state management.
-   **Backend (Python):** `Flask`, `NumPy`/`SciPy`, `Pandas`, and `Black-Scholes` for calculations.

#### Data Flow
1.  Frontend requests market data for selected symbol.
2.  Python backend fetches options chain data.
3.  Black-Scholes model calculates implied volatilities.
4.  Surface interpolation creates a smooth 3D grid.
5.  Frontend renders interactive visualizations.

---

### 🔧 Development

#### Available Scripts
| Script | Description |
| :--- | :--- |
| `pnpm start` / `npm start` | Starts the frontend development server |
| `pnpm build` / `npm run build` | Builds the application for production |
| `pnpm test` / `npm test` | Runs tests |

---

### Key Dependencies

-   **React** `18.3.1`: Modern React with hooks and concurrent features
-   **Plotly.js** `2.35.3`: Advanced plotting and visualization
-   **styled-components** `6.0.7`: CSS-in-JS styling solution
-   **Antd** `5.9.0`: UI component library for professional interfaces
