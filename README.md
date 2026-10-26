# ADAH JEWELS — Luxury Jewellery Storefront & Admin Studio

> *Minimal. Elegant. Meaningful. Discover pieces that add a little more you to every moment.*

A boutique e-commerce web application featuring an aesthetic, editorial customer storefront and a dedicated, private Admin & Stock Management Portal with real-time multi-tab synchronization.

---

## ✦ Key Features

### 1. Customer Storefront (`/` or `index.html`)
* **Editorial Silk Hero Section**: Champagne-draped luxury aesthetic matching boutique high-jewelry branding with interactive slider.
* **Curated Collection Grid**: 4 category portals — Necklaces & Pendants, Earrings, Bracelets & Bangles, Rings.
* **Running Moving Products Showcase**: Infinite smooth horizontal marquee showcasing trending, in-stock jewellery pieces.
* **Live Product Catalogue**: Filterable by category or price tier (`₹50`, `₹60`, `₹100`, `₹120`, `Luxury Edit`) with real-time stock badges (*Sold Out*, *Low Stock*).
* **Shopping Bag & Wishlist Drawers**: Seamless slide-out bag with quantity counters, subtotal calculations, and wishlist favorites.
* **1-Click WhatsApp Ordering**: Direct order generator sending SKU IDs, product names, and pricing directly to WhatsApp (`+91 8979660550`).

### 2. Private Studio Admin Portal (`/admin` or `admin.html`)
* **Private Authentication Gate**: Protected by studio credentials.
  * **Username**: `somya`
  * **Password**: `gunshika`
* **Real-Time Consistency & Synchronization**: Instantaneous synchronization between Admin actions and the customer storefront via `BroadcastChannel('adah_catalogue_sync')` and `/api/products`.
* **Stock & Inventory Control**: Live stepper counters (`+` / `-`) that instantly update stock status and customer purchase availability.
* **Showcase Visibility Toggle**:
  * **Showcased**: Live and visible across both catalogue grid and running marquee.
  * **Off Showcase**: Instantly hidden from customer storefront and marquee without deleting inventory.
* **Fail-Proof Product Deletion**: Direct inline confirmation (`[Delete? ✓ Yes ✕]`) right in the row and confirmation modal that permanently removes products from the database.
* **Product Studio**: Upload custom photography, set SKU ID, category, pricing, stock count, and descriptions.
* **Data Backup & Export**: Download complete catalogue snapshots as JSON or restore factory defaults.

---

## ✦ Project Structure

```
├── index.html            # Customer-facing luxury storefront
├── admin.html            # Private Admin & Stock Management Portal
├── server.py             # Python HTTP & REST API server
├── css/
│   ├── styles.css        # Luxury boutique storefront stylesheet
│   └── admin.css         # Admin dashboard and authentication stylesheet
├── js/
│   ├── main.js           # Storefront logic, cart, wishlist, real-time sync
│   ├── admin.js          # Admin catalogue, stock steppers, delete, auth
│   └── products.js       # Curated default pieces & SVG fallback generators
├── assets/               # Jewellery photography & collection imagery
├── data/
│   └── products.json     # Authoritative persistent products database
└── README.md
```

---

## ✦ Running Locally

Ensure you have Python installed:

```bash
# Start the local development and API server
python server.py
```

* **Storefront**: [http://localhost:8000/](http://localhost:8000/)
* **Admin Portal**: [http://localhost:8000/admin](http://localhost:8000/admin)

---

## ✦ Admin Login Credentials

| Field | Value |
|---|---|
| **Username** | `somya` |
| **Password** | `gunshika` |

---

## ✦ License & Rights
© 2026 ADAH JEWELS. All rights reserved.