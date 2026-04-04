"""
Seed script — generates realistic mock data across all 7 supported cities.
Run from backend/: python seed.py
"""
import asyncio
import random
from datetime import datetime, timedelta
import string as st

from database import init_db, AsyncSessionLocal
from models import (
    Driver, Hub, Delivery, HubBroadcast, DeliveryStatus, PackageSize, HubType,
    User, UserRole, Dispatcher, DeliveryBatch,
)
from auth import hash_password

CITIES = ['Hyderabad', 'Mumbai', 'Chennai', 'Delhi', 'Bengaluru', 'Kolkata']

CITY_DATA = {
    'Hyderabad': {
        'coords': (17.3850, 78.4867),
        'bounds': {'lat': (17.3500, 17.4800), 'lng': (78.3500, 78.5000)},
        'addresses': [
            "Plot 42, Road No.12, Banjara Hills, Hyderabad - 500034",
            "Flat 3B, Vasavi Towers, Kondapur, Hyderabad - 500084",
            "H.No 15, Srinagar Colony, Ameerpet, Hyderabad - 500016",
            "Shop 7, Jubilee Hills Check Post, Hyderabad - 500033",
            "Plot 88, Madhapur, HITEC City, Hyderabad - 500081",
        ],
        'hubs': ["Banjara Hills Hub", "Madhapur Kirana", "Kondapur Pharmacy"]
    },
    'Mumbai': {
        'coords': (19.0760, 72.8777),
        'bounds': {'lat': (18.9500, 19.2000), 'lng': (72.8000, 72.9000)},
        'addresses': [
            "Flat 202, Pali Hill, Bandra West, Mumbai - 400050",
            "Building 5, Hiranandani Gardens, Powai, Mumbai - 400076",
            "Shop 12, Colaba Causeway, Mumbai - 400001",
            "Plot 44, Juhu Tara Road, Mumbai - 400049",
            "Office 501, Maker Chambers, Nariman Point, Mumbai - 400021",
        ],
        'hubs': ["Bandra West Hub", "Powai Smart Point", "Colaba Express"]
    },
    'Delhi': {
        'coords': (28.7041, 77.1025),
        'bounds': {'lat': (28.5000, 28.7500), 'lng': (77.0500, 77.2500)},
        'addresses': [
            "H-Block, Connaught Place, New Delhi - 110001",
            "Sector 12, Dwarka, Delhi - 110075",
            "Green Park Extension, New Delhi - 110016",
            "Pocket B, Sarita Vihar, Delhi - 110076",
            "Greater Kailash Part 1, New Delhi - 110048",
        ],
        'hubs': ["CP Central Hub", "Dwarka Sector 12", "South Delhi Relay"]
    },
    'Bengaluru': {
        'coords': (12.9716, 77.5946),
        'bounds': {'lat': (12.9000, 13.0500), 'lng': (77.5000, 77.7000)},
        'addresses': [
            "100 Ft Road, Indiranagar, Bengaluru - 560038",
            "4th Block, Koramangala, Bengaluru - 560034",
            "ITPL Main Road, Whitefield, Bengaluru - 560066",
            "Lavelle Road, Bengaluru - 560001",
            "Richmond Town, Bengaluru - 560025",
        ],
        'hubs': ["Indiranagar Hub", "Whitefield Ops Center", "Koramangala 4th Block"]
    },
    'Chennai': {
        'coords': (13.0827, 80.2707),
        'bounds': {'lat': (12.9500, 13.1500), 'lng': (80.1500, 80.3000)},
        'addresses': [
            "Poes Garden, Chennai - 600086",
            "Besant Nagar, Chennai - 600090",
            "OMR Road, Sholinganallur, Chennai - 600119",
            "Anna Nagar West, Chennai - 600040",
            "Nungambakkam High Road, Chennai - 600034",
        ],
        'hubs': ["Anna Nagar Hub", "OMR Tech Relay", "Adyar Micro-Hub"]
    },
    'Kolkata': {
        'coords': (22.5726, 88.3639),
        'bounds': {'lat': (22.4500, 22.6500), 'lng': (88.3000, 88.4500)},
        'addresses': [
            "Park Street, Kolkata - 700016",
            "Salt Lake Sector V, Kolkata - 700091",
            "Ballygunge Circular Road, Kolkata - 700019",
            "New Town Action Area 1, Kolkata - 700156",
            "Alipore, Kolkata - 700027",
        ],
        'hubs': ["Salt Lake Sector V", "Park Street Central", "New Town Hub"]
    }
}

DRIVER_NAMES = [
    "Arjun Reddy", "Priya Sharma", "Mohammed Farhan", "Sneha Patel", "Karthik Nair",
    "Rahul Verma", "Anita Singh", "Suresh Babu", "Deepa Krishnan", "Vikram Chandra",
    "Meena Reddy", "Anil Kumar", "Sunita Joshi", "Ravi Teja", "Priyanka Das",
    "Rajesh Khanna", "Sita Devi", "Karan Johar", "Vijay Sethupathi", "Naveen Polishetty"
]

RECIPIENT_NAMES = [
    "Rahul Verma", "Anita Singh", "Suresh Babu", "Deepa Krishnan",
    "Vikram Chandra", "Meena Reddy", "Anil Kumar", "Sunita Joshi",
    "Ravi Teja", "Priyanka Das", "Mohan Lal", "Kavya Nair",
    "Amitabh", "Deepika", "Ranbir", "Alia"
]

async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        from sqlalchemy import text

        # Clear in dependency order
        await db.execute(text("DELETE FROM hub_broadcasts"))
        await db.execute(text("DELETE FROM deliveries"))
        await db.execute(text("DELETE FROM delivery_batches"))
        await db.execute(text("DELETE FROM dispatchers"))
        await db.execute(text("DELETE FROM hubs"))
        await db.execute(text("DELETE FROM drivers"))
        await db.execute(text("DELETE FROM users"))
        await db.commit()

        # ── Seed dispatcher ───────────────────────────────────────────────────
        dispatcher = Dispatcher(
            name="Dispatch Admin",
            email="dispatcher@neardrop.in",
            password_hash=hash_password("dispatch123"),
        )
        db.add(dispatcher)
        await db.flush()

        all_drivers = []
        all_hubs = []
        now = datetime.utcnow()
        driver_pw = hash_password("driver123")
        hub_pw = hash_password("hub123")
        
        user_count = 1

        for city in CITIES:
            data = CITY_DATA[city]
            lat_min, lat_max = data['bounds']['lat']
            lng_min, lng_max = data['bounds']['lng']

            # ── Seed drivers for city ──────────────────────────────────────────
            city_drivers = []
            for i in range(4): # 4 drivers per city
                name = f"{random.choice(DRIVER_NAMES)} ({city})"
                lat = round(random.uniform(lat_min, lat_max), 4)
                lng = round(random.uniform(lng_min, lng_max), 4)
                
                driver = Driver(
                    name=name,
                    lat=lat,
                    lng=lng,
                    status=DeliveryStatus.en_route if random.random() > 0.3 else DeliveryStatus.delivered,
                    trust_score=random.randint(70, 98),
                    vehicle=random.choice(["Royal Enfield", "Activa", "TVS Jupiter", "Honda Shine", "Bajaj Pulsar"]),
                    phone=f"+91 98765 {random.randint(10000, 99999)}",
                    city=city,
                    last_ping_at=now - timedelta(minutes=random.randint(1, 10))
                )
                db.add(driver)
                city_drivers.append(driver)
                all_drivers.append(driver)
            await db.flush()

            # Create users for drivers
            for d in city_drivers:
                db.add(User(
                    phone=f"9{user_count:09d}",
                    hashed_password=driver_pw,
                    role=UserRole.driver,
                    name=d.name,
                    driver_id=d.id
                ))
                user_count += 1

            # ── Seed hubs for city ─────────────────────────────────────────────
            city_hubs = []
            for hub_name in data['hubs']:
                lat = round(random.uniform(lat_min, lat_max), 4)
                lng = round(random.uniform(lng_min, lng_max), 4)
                hub = Hub(
                    name=hub_name,
                    owner_name=f"Owner {random.randint(1, 100)}",
                    lat=lat,
                    lng=lng,
                    hub_type=random.choice(list(HubType)),
                    trust_score=random.randint(80, 95),
                    today_earnings=random.uniform(50.0, 300.0),
                    city=city,
                    capacity=random.randint(15, 30),
                    current_load=random.randint(0, 10)
                )
                db.add(hub)
                city_hubs.append(hub)
                all_hubs.append(hub)
            await db.flush()

            # Create users for hubs
            for h in city_hubs:
                db.add(User(
                    phone=f"8{user_count:09d}",
                    hashed_password=hub_pw,
                    role=UserRole.hub_owner,
                    name=h.owner_name,
                    hub_id=h.id
                ))
                user_count += 1

            # ── Seed deliveries for city ───────────────────────────────────────
            base_time = now.replace(hour=7, minute=0, second=0, microsecond=0)
            
            # Sort drivers by trust score descending so best drivers get most orders
            sorted_drivers = sorted(city_drivers, key=lambda d: d.trust_score, reverse=True)
            # We have 15 deliveries per city. Distribute them biased towards top drivers.
            # E.g. top driver gets 8, second gets 4, third gets 2, fourth gets 1.
            delivery_assignments = [8, 4, 2, 1]
            driver_pool = []
            for d, count in zip(sorted_drivers, delivery_assignments):
                driver_pool.extend([d] * count)

            for i in range(15): # 15 standalone deliveries per city
                driver = driver_pool[i]
                
                # Biased success rate based on driver's initial trust score
                success_prob = driver.trust_score / 100.0
                status = random.choices(
                    [DeliveryStatus.delivered, DeliveryStatus.failed, DeliveryStatus.en_route, DeliveryStatus.arrived],
                    weights=[success_prob, 0.15, 0.1, 0.05]
                )[0]
                
                offset_mins = random.randint(0, 480)
                created = base_time + timedelta(minutes=offset_mins)
                delivered_at = created + timedelta(minutes=random.randint(15, 45)) if status == DeliveryStatus.delivered else None

                addr = random.choice(data['addresses'])
                lat = round(random.uniform(lat_min, lat_max), 4)
                lng = round(random.uniform(lng_min, lng_max), 4)

                delivery = Delivery(
                    driver_id=driver.id,
                    address=addr,
                    lat=lat,
                    lng=lng,
                    status=status,
                    package_size=random.choice(list(PackageSize)),
                    weight_kg=round(random.uniform(0.2, 10.0), 1),
                    created_at=created,
                    delivered_at=delivered_at,
                    recipient_name=random.choice(RECIPIENT_NAMES),
                    order_id=f"ND-{city[:3].upper()}-{1000 + i + (CITIES.index(city)*20)}",
                    city=city,
                    failure_reason="Customer not available" if status == DeliveryStatus.failed else None
                )
                db.add(delivery)
                await db.flush()

                # If failed, add a hub broadcast
                if status == DeliveryStatus.failed:
                    hub = random.choice(city_hubs)
                    code = "".join(random.choices(st.digits, k=6))
                    db.add(HubBroadcast(
                        delivery_id=delivery.id,
                        hub_id=hub.id,
                        pickup_code=code,
                        broadcast_at=delivery.created_at + timedelta(minutes=2),
                        accepted_at=delivery.created_at + timedelta(minutes=5),
                    ))
                    hub.today_earnings += 25.0

        await db.commit()
        print(f"Seed complete: {len(all_drivers)} drivers, {len(all_hubs)} hubs across {len(CITIES)} cities.")

if __name__ == "__main__":
    asyncio.run(seed())
