# FixKart

FixKart is a platform combining:
1. A hardware marketplace (tools, plumbing, electrical, automotive supplies, etc.)
2. An on-demand services platform (plumbers, electricians, carpenters, mechanics, painters, AC technicians, etc.)

## Status

This repository currently contains only the **basic HTML5 structural scaffold**.
No CSS, no JavaScript, no backend, no database, and no authentication logic have been implemented yet.
The goal of this stage is to establish the full page/file architecture so the team can build on it independently.

## Team

| Name    | Role                  |
|---------|-----------------------|
| Ankit   | Frontend              |
| Nikita  | Frontend              |
| Navya   | Backend + Database    |
| Raghav  | Backend + Database    |

## Project Structure

```
FixKart/
│
├── index.html                  Homepage
│
├── pages/                      Shared, role-agnostic pages (marketplace, services, auth, account, static)
│   ├── products.html
│   ├── product-details.html
│   ├── services.html
│   ├── service-details.html
│   ├── professionals.html
│   ├── professional-profile.html
│   ├── cart.html
│   ├── checkout.html
│   ├── order-confirmation.html
│   ├── orders.html
│   ├── booking.html
│   ├── booking-confirmation.html
│   ├── bookings.html
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   ├── profile.html
│   ├── addresses.html
│   ├── about.html
│   ├── contact.html
│   ├── privacy.html
│   ├── terms.html
│   └── 404.html
│
├── admin/                       Admin dashboard entry point
│   └── index.html
│
├── vendor/                      Vendor dashboard entry point
│   └── index.html
│
├── professional/                 Professional dashboard entry point
│   └── index.html
│
├── assets/
│   ├── images/                  Product, professional, and marketing images
│   ├── icons/                   Icon assets
│   └── fonts/                   Font files
│
├── css/                          Stylesheets (empty for now)
│
├── js/                            Scripts (empty for now)
│
└── README.md
```

## Navigation Flows

**Marketplace:** Home → Products → Product Details → Cart → Checkout → Order Confirmation → Orders

**Services:** Home → Services → Service Details → Professionals → Professional Profile → Booking → Booking Confirmation → Bookings

## Next Steps

- Add CSS to `css/`
- Add JavaScript to `js/`
- Wire up backend/database (Navya, Raghav)
- Flesh out page content (Ankit, Nikita)
