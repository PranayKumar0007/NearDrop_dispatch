"""
Seed script — generates realistic mock data for Hyderabad.
Run: python -m backend.seed
"""
import asyncio
import random
from datetime import datetime, timedelta

from backend.database import init_db, AsyncSessionLocal
from backend.models import Driver, Hub, Delivery, HubBroadcast, DeliveryStatus, PackageSize, HubType


DRIVERS = [
    {"name": "Arjun Reddy",      "lat": 17.4239, "lng": 78.4738, "status": DeliveryStatus.en_route,  "trust_score": 94, "vehicle": "Royal Enfield",  "phone": "+91 98765 43210"},
    {"name": "Priya Sharma",     "lat": 17.4456, "lng": 78.3647, "status": DeliveryStatus.delivered,  "trust_score": 88, "vehicle": "Activa",          "phone": "+91 98765 43211"},
    {"name": "Mohammed Farhan",  "lat": 17.4123, "lng": 78.4501, "status": DeliveryStatus.failed,     "trust_score": 79, "vehicle": "TVS Jupiter",     "phone": "+91 98765 43212"},
    {"name": "Sneha Patel",      "lat": 17.4385, "lng": 78.3892, "status": DeliveryStatus.arrived,    "trust_score": 96, "vehicle": "Honda Shine",     "phone": "+91 98765 43213"},
    {"name": "Karthik Nair",     "lat": 17.4501, "lng": 78.4012, "status": DeliveryStatus.en_route,  "trust_score": 71, "vehicle": "Bajaj Pulsar",    "phone": "+91 98765 43214"},
]

HUBS = [
    {"name": "Sri Ram Kirana Store",       "owner_name": "Ramesh Kumar",     "lat": 17.4267, "lng": 78.4486, "hub_type": HubType.kirana,    "trust_score": 91, "today_earnings": 125.0},
    {"name": "Lakshmi General Store",      "owner_name": "Latha Devi",       "lat": 17.4412, "lng": 78.3761, "hub_type": HubType.kirana,    "trust_score": 87, "today_earnings": 75.0},
    {"name": "City Pharmacy - Kondapur",   "owner_name": "Dr. Venkat Rao",   "lat": 17.4602, "lng": 78.3548, "hub_type": HubType.pharmacy,  "trust_score": 95, "today_earnings": 200.0},
    {"name": "Vasavi Apartments Reception","owner_name": "Security: Suresh", "lat": 17.4321, "lng": 78.4123, "hub_type": HubType.apartment, "trust_score": 82, "today_earnings": 50.0},
    {"name": "Madhapur Medicals",          "owner_name": "Srinivas Goud",    "lat": 17.4478, "lng": 78.3921, "hub_type": HubType.pharmacy,  "trust_score": 89, "today_earnings": 150.0},
    {"name": "Hitech City Kirana",         "owner_name": "Anand Sharma",     "lat": 17.4456, "lng": 78.3815, "hub_type": HubType.kirana,    "trust_score": 93, "today_earnings": 225.0},
    {"name": "Prestige Plaza Reception",   "owner_name": "Security: Rakesh", "lat": 17.4189, "lng": 78.4634, "hub_type": HubType.apartment, "trust_score": 85, "today_earnings": 100.0},
    {"name": "Jubilee Hills Mini Mart",    "owner_name": "Pallavi Rao",      "lat": 17.4312, "lng": 78.4089, "hub_type": HubType.kirana,    "trust_score": 90, "today_earnings": 175.0},
]

ADDRESSES = [
    "Plot 42, Road No.12, Banjara Hills, Hyderabad - 500034",
    "Flat 3B, Vasavi Towers, Kondapur, Hyderabad - 500084",
    "H.No 15, Srinagar Colony, Ameerpet, Hyderabad - 500016",
    "Shop 7, Jubilee Hills Check Post, Hyderabad - 500033",
    "Plot 88, Madhapur, HITEC City, Hyderabad - 500081",
    "Flat 201, Aditya Heights, Gachibowli, Hyderabad - 500032",
    "H.No 33, Road 5, Banjara Hills, Hyderabad - 500034",
    "Flat 4A, My Home Hub, Hitech City, Hyderabad - 500081",
    "Plot 12, Kavuri Hills, Madhapur, Hyderabad - 500033",
    "Office 301, Cyber Towers, HITEC City, Hyderabad - 500081",
    "Villa 22, Jubilee Hills Phase 2, Hyderabad - 500033",
    "Flat 501, Lotus Pond, Khairatabad, Hyderabad - 500004",
]

RECIPIENT_NAMES = [
    "Rahul Verma", "Anita Singh", "Suresh Babu", "Deepa Krishnan",
    "Vikram Chandra", "Meena Reddy", "Anil Kumar", "Sunita Joshi",
    "Ravi Teja", "Priyanka Das", "Mohan Lal", "Kavya Nair",
]


async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Clear existing
        from sqlalchemy import text
        await db.execute(text("DELETE FROM hub_broadcasts"))
        await db.execute(text("DELETE FROM deliveries"))
        await db.execute(text("DELETE FROM hubs"))
        await db.execute(text("DELETE FROM drivers"))
        await db.commit()

        # Seed drivers
        drivers = []
        for d in DRIVERS:
            driver = Driver(**d)
            db.add(driver)
            drivers.append(driver)
        await db.flush()

        # Seed hubs
        hubs = []
        for h in HUBS:
            hub = Hub(**h)
            db.add(hub)
            hubs.append(hub)
        await db.flush()

        # Seed deliveries (50 spread across today)
        base_time = datetime.utcnow().replace(hour=7, minute=0, second=0, microsecond=0)
        statuses = (
            [DeliveryStatus.delivered] * 32 +
            [DeliveryStatus.failed] * 8 +
            [DeliveryStatus.en_route] * 7 +
            [DeliveryStatus.arrived] * 3
        )
        random.shuffle(statuses)

        for i in range(50):
            driver = random.choice(drivers)
            status = statuses[i]
            offset_mins = random.randint(0, 600)
            created = base_time + timedelta(minutes=offset_mins)
            delivered_at = created + timedelta(minutes=random.randint(15, 45)) if status == DeliveryStatus.delivered else None

            delivery = Delivery(
                driver_id=driver.id,
                address=random.choice(ADDRESSES),
                status=status,
                package_size=random.choice(list(PackageSize)),
                weight_kg=round(random.uniform(0.2, 10.0), 1),
                created_at=created,
                delivered_at=delivered_at,
                recipient_name=random.choice(RECIPIENT_NAMES),
                order_id=f"ND{10000 + i}",
            )
            db.add(delivery)

        await db.flush()

        # Add broadcasts for failed deliveries
        failed_result = await db.execute(
            __import__("sqlalchemy", fromlist=["select"]).select(Delivery).where(Delivery.status == DeliveryStatus.failed)
        )
        failed_deliveries = failed_result.scalars().all()

        for fd in failed_deliveries:
            hub = random.choice(hubs)
            import random as rnd
            import string as st
            code = "".join(rnd.choices(st.digits, k=6))
            broadcast = HubBroadcast(
                delivery_id=fd.id,
                hub_id=hub.id,
                pickup_code=code,
                broadcast_at=fd.created_at + timedelta(minutes=2),
                accepted_at=fd.created_at + timedelta(minutes=5),
            )
            hub.today_earnings += 25.0
            db.add(broadcast)

        await db.commit()
        print("✅ Seed complete: 5 drivers, 8 hubs, 50 deliveries")


if __name__ == "__main__":
    asyncio.run(seed())
