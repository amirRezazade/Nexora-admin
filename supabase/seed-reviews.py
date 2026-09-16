#!/usr/bin/env python3
"""Generate realistic reviews and POST them to Supabase."""
import json, math, random, urllib.request
from datetime import datetime, timedelta, timezone

KEY = "sb_publishable_aNo4PzSif8eS7OKLwv6Z4g_dfBBCXxG"
BASE = "https://akqrnvrgsnofnhrhlxow.supabase.co"

def api(method, path, body=None, extra=None):
    headers = {
        "apikey": KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    if extra:
        headers.update(extra)
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as res:
        raw = res.read()
        return res.status, raw.decode() if raw else ""

def get(path):
    headers = {"apikey": KEY}
    req = urllib.request.Request(BASE + path, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as res:
        return json.loads(res.read().decode())

products = get("/rest/v1/products?select=id,name,brand,tags,status,category_id&order=id")
customers = [c for c in get("/rest/v1/customers?select=id,name,segment,status") if c["status"] == "active"]

rng = random.Random(20260830)

TITLES = {
    5: [
        "Exactly what I hoped for",
        "Worth every euro",
        "Repeat purchase",
        "Better than expected",
        "Daily driver now",
        "Gifted it — they loved it",
        "Build quality is excellent",
        "Quietly impressive",
    ],
    4: [
        "Great, with one caveat",
        "Solid everyday pick",
        "Happy overall",
        "Would buy again",
        "Close to perfect",
        "Good value",
    ],
    3: [
        "Fine, not amazing",
        "Does the job",
        "Mixed feelings",
        "Almost there",
    ],
    2: [
        "Not for me",
        "Expected more",
    ],
    1: [
        "Sending it back",
    ],
}

BODIES = {
    5: [
        "Fit is true to size and the finish feels genuinely premium. Arrived in three days to Germany, packing was minimal which I appreciate.",
        "Used it daily for a month. No signs of wear, stitching is clean, and it matches the photos.",
        "I compared three alternatives before buying. This is the one I would choose again without thinking.",
        "The material feels more substantial in person. Customer support answered within a day when I asked about sizing.",
        "Second one I have bought. Consistent quality across both orders, which is rarer than it should be.",
        "Looks considered, not loud. Gets compliments without trying. Sizing was accurate for me.",
    ],
    4: [
        "Quality is excellent but the colour is a shade darker than the photos. Still keeping it.",
        "Comfortable and well made. Shipping took a little longer than the estimate, otherwise no complaints.",
        "Really happy with it. I would have liked one extra size option, but the one I got works.",
        "Does what it says. A bit pricey at full fare — I waited for a code and that made it easy to recommend.",
        "Finish is clean, nothing cheap about it. Deducting a star because the care notes were easy to miss.",
    ],
    3: [
        "Well made, but it runs a little small. I kept it after a week of breaking in. Not a disaster, not a standout.",
        "Fine for the price. I wanted it to feel a step more premium. It is perfectly usable.",
        "Does the job. If you already own something similar you will not be converted. If you need one, it is honest.",
    ],
    2: [
        "Quality is decent but the sizing ran small and I had to exchange. More friction than it needed.",
        "Looks good in photos. In hand it felt lighter than I expected. Not defective, just not for me.",
    ],
    1: [
        "Arrived with a scuff on the edge. Support was polite but slow. I asked for a return.",
    ],
}

SPECIFIC = {
    "cat-sneakers": {
        5: "Cushioning holds up after a full day walking. No hot spots, and they look clean with trousers.",
        4: "Comfortable out of the box. Sole is a touch firmer than I like for long runs, fine for city use.",
        3: "Look good. Need a thicker insole for all-day wear.",
    },
    "cat-footwear": {
        5: "Broke in within a week. The leather already looks better than day one.",
        4: "Solid construction. A little stiff at first, as they should be.",
        3: "Nice shape, but I needed thicker socks for the first days.",
    },
    "cat-apparel": {
        5: "Fabric weight is exactly as described. Washed it twice, no shrink, collar still sits right.",
        4: "Soft and well cut. I usually take M and M is right, maybe a hint roomy in the shoulder.",
        3: "Colour is slightly different from the swatch. Fit is okay if you like it relaxed.",
    },
    "cat-outerwear": {
        5: "Blocks wind without feeling like a bin bag. Packs smaller than I expected.",
        4: "Warm enough for autumn. Hood is useful. Zipper is smooth.",
        3: "Fine shell. I wanted a bit more length.",
    },
    "cat-accessories": {
        5: "Edges are clean, hardware feels heavy in a good way. Already scuffed in nicely.",
        4: "Does what I bought it for. Slim enough for a jacket pocket.",
        3: "Looks the part. I wish the strap adjusted one notch further.",
    },
    "cat-audio": {
        5: "Seal is good, battery easily lasts a work week. Calls are clearer than my last pair.",
        4: "Sound is clean. ANC is strong on trains, a little less so in an open office.",
        3: "Fine for the price. Bass is polite, not for gym playlists.",
    },
    "cat-home": {
        5: "Feels like something you keep. Glaze / finish is even, nothing rattles.",
        4: "Nice on the shelf and actually useful. Gifted a second one.",
        3: "Does the job. A bit smaller than I pictured.",
    },
    "cat-tech": {
        5: "Sits well on the desk, no rattle, cable management is thought through.",
        4: "Does exactly what the spec says. Runs slightly warm which I expected.",
        3: "Works. The software extras are more than I will use.",
    },
    "cat-fitness": {
        5: "Grip stays put, no chemical smell after unrolling. Using it most mornings.",
        4: "Stable and easy to store. Thickness is honest.",
        3: "Okay. I wanted a bit more cushion at the knees.",
    },
}

def star_for(product):
    tags = product.get("tags") or []
    if product.get("status") == "draft":
        roll = rng.random()
        if roll < 0.45: return 5
        if roll < 0.8: return 4
        return 3
    if "bestseller" in tags or "flagship" in tags:
        roll = rng.random()
        if roll < 0.62: return 5
        if roll < 0.88: return 4
        if roll < 0.96: return 3
        return 2
    roll = rng.random()
    if roll < 0.48: return 5
    if roll < 0.82: return 4
    if roll < 0.93: return 3
    if roll < 0.98: return 2
    return 1

def count_for(product):
    tags = product.get("tags") or []
    if product.get("status") == "draft":
        return rng.randint(2, 4)
    if product.get("status") == "archived":
        return rng.randint(3, 5)
    if "bestseller" in tags:
        return rng.randint(7, 9)
    if "flagship" in tags:
        return rng.randint(6, 8)
    return rng.randint(4, 6)

TODAY = datetime(2026, 8, 21, tzinfo=timezone.utc)

reviews = []
n = 3000
used_pair = set()

for p in products:
    k = count_for(p)
    pending_n = 1 if rng.random() < 0.35 else 0
    hidden_n = 1 if rng.random() < 0.08 else 0
    total = k + pending_n + hidden_n
    pool = list(customers)
    rng.shuffle(pool)
    for i in range(total):
        cust = pool[i % len(pool)]
        pair = (p["id"], cust["id"])
        if pair in used_pair:
            continue
        used_pair.add(pair)
        n += 1
        if i < hidden_n:
            status = "hidden"
        elif i < hidden_n + pending_n:
            status = "pending"
        else:
            status = "published"
        rating = star_for(p)
        if status != "published":
            rating = star_for(p)
        cat = p["category_id"]
        specific = SPECIFIC.get(cat, {}).get(rating)
        if specific and rng.random() < 0.55:
            body = specific
        else:
            body = rng.choice(BODIES[rating])
        body = f"{body} Bought the {p['name']}."
        days = int(rng.random() ** 0.7 * 200) + 2
        created = TODAY - timedelta(days=days, hours=rng.randint(0, 20))
        reviews.append({
            "id": f"rev-{n}",
            "product_id": p["id"],
            "product_name": p["name"],
            "customer_id": cust["id"],
            "customer_name": cust["name"],
            "rating": rating,
            "title": rng.choice(TITLES[rating]),
            "body": body,
            "created_at": created.isoformat().replace("+00:00", "Z"),
            "status": status,
            "verified": cust["segment"] in ("VIP", "Returning") and rng.random() < 0.9,
            "helpful": int(rng.random() ** 2 * 28),
        })

reviews.sort(key=lambda r: r["created_at"], reverse=True)
print("reviews", len(reviews), "published", sum(1 for r in reviews if r["status"] == "published"))

# wipe existing (none expected)
st, _ = api("DELETE", "/rest/v1/reviews?id=neq.placeholder")
print("delete", st)

for i in range(0, len(reviews), 40):
    chunk = reviews[i:i+40]
    st, _ = api("POST", "/rest/v1/reviews", chunk)
    print(f"post {i+1}-{i+len(chunk)} HTTP {st}")

# compute published averages and patch products (works even before trigger)
from collections import defaultdict
agg = defaultdict(list)
for r in reviews:
    if r["status"] == "published":
        agg[r["product_id"]].append(r["rating"])

for p in products:
    scores = agg.get(p["id"], [])
    cnt = len(scores)
    avg = round(sum(scores) / cnt, 1) if cnt else 0
    st, _ = api("PATCH", f"/rest/v1/products?id=eq.{p['id']}", {"rating": avg, "review_count": cnt})
    print(f"{p['id']} {p['name'][:28]:28} {avg} / {cnt}  patch {st}")

open("/home/user/nova/supabase/reviews.json", "w").write(json.dumps(reviews, indent=2))
print("wrote reviews.json")
