# Alaba Dorf Outlet Management & Ordering System

## Overview

Alaba Dorf Outlet is a multi-section business consisting of a **Farm**, **Cow & Pig Sharing**, **Photo Studio**, and **Eatery**. This project is a **centralised online ordering and business management system** that allows customers to place orders and bookings online while giving staff a central system for managing inventory, orders, payments, bookings, and fulfilment.

## Goals

The system is designed to eliminate:

- Forgotten orders
- Lost customer information
- Overbooking
- Selling more stock than is available
- Confusion about paid/unpaid orders
- Studio booking clashes
- Difficulty tracking pending orders
- Manual record keeping

## Target Users

| Role | Description |
|------|-------------|
| **Customers** | Buy eggs, reserve meat, order food, book photo sessions — no account required |
| **Top Admins** (2) | Full access: manage products, stock, prices, reports, admin accounts, permissions |
| **Farm Admin** | Egg stock, cow/pig sharing, farm orders, payments, fulfilment |
| **Eatery Admin** | Food menu, availability, prices, orders, preparation, fulfilment |
| **Photo Studio Admin** | Studio availability, session types, prices, bookings, calendar |

## Core Features (MVP)

### Customer-Facing

- **Homepage** with clear sections: Farm, Photo Studio, Eatery
- **Farm — Eggs**: Browse crates, order, pickup/delivery, automatic stock deduction
- **Farm — Cow & Pig Sharing**: Reserve kilograms from shared animals, automatic weight tracking
- **Photo Studio**: Browse session types, view available dates/times, book slots (no double-booking)
- **Eatery**: Browse menu, cart, quantities, mandatory prepayment
- **Checkout**: Simple 6-step flow (review → details → delivery → total → payment → confirmation)
- **Order Tracking**: Customers check status via order number (e.g., `#ADO1042`)

### Admin-Facing

- **Dashboard**: Today's overview — orders, sales, stock, bookings, pending deliveries
- **"Requires Attention"**: Highlights orders/bookings needing action (payment confirmed but not processed, low stock, failed payment, etc.)
- **Order Management**: Status workflow (Pending Payment → Confirmed → Preparing → Ready → Out for Delivery → Completed / Cancelled)
- **Inventory Management**: Automatic tracking (Total → Reserved → Sold → Available)
- **Animal Sharing Management**: Create listings, track reservations, adjust final weights
- **Studio Calendar**: View/block dates and time slots
- **Eatery Menu Management**: Add/edit/remove items, set prices and availability
- **Customer Records**: Name, phone, order history, booking history
- **Reports**: Filterable by date, department, product, status
- **Activity Log**: All important admin actions recorded
- **Permission System**: Top Admins control what Department Admins can access

## Payment

- Online payment integration (Nigerian payment providers)
- No pay-on-delivery for food orders in V1
- Payment states: Unpaid → Processing → Paid / Failed / Refunded

## Technology

> *To be determined — see the PRD for full requirements.*

## Project Status

**V1.0 — MVP** — In development

## Documentation

See the full [Product Requirements Document](../PRODUCT%20REQUIREMENTS%20DOCUMENT%20(PRD).md) for complete specifications.

## License

Private — All rights reserved.
