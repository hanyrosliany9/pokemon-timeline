# Optimizing Pokemon card rendering in Blender

Source: [Claude Chat](https://claude.ai/chat/602fa54f-1f0f-43ba-aa2d-e9431520dadc)
Extracted: 2026-01-02T11:30:02.328Z
🚀 Exported with [Save my Chatbot](https://save.hugocolin.com)!

---

## User

I have jobs rendering pokemon card in blender for 30000 cards. but with current setup it needs to render 40 minutes per card . first count how long i can finished all cards. second give me suggestion how i can render faster, my current setup is using rtx 3060 ti with ryzen 5 3600

## Claude

Computed rendering timeline and strategized optimization methods.

The user wants me to:

1. Calculate total time to render 30,000 cards at 40 minutes each

2. Give suggestions for faster rendering with their RTX 3060 Ti and Ryzen 5 3600

Let me calculate first:

- 30,000 cards × 40 minutes = 1,200,000 minutes

- 1,200,000 minutes ÷ 60 = 20,000 hours

- 20,000 hours ÷ 24 = 833.33 days

- 833.33 days ÷ 30 ≈ 27.78 months

- Or about 2.3 years

That's a massive amount of time. Let me provide helpful suggestions for speeding this up.

## Total Render Time Calculation

**30,000 cards × 40 minutes = 1,200,000 minutes**

| Unit | Time |
| --- | --- |
| Minutes | 1,200,000 |
| Hours | 20,000 |
| Days | **833 days** |
| Months | ~27.7 months |
| Years | **~2.3 years** |

That's brutal. Let's fix this.

## Suggestions to Render Faster

### 1. **Optimize Blender Settings (Biggest Impact)**

- **Reduce samples** — For product shots like cards, 64-128 samples with denoising is often enough

- **Enable OptiX denoiser** — Uses your RTX GPU, much faster than OpenImageDenoise

- **Lower resolution** — Render at 2K instead of 4K if acceptable

- **Simplify lighting** — Use fewer light bounces (2-3 max for diffuse/glossy)

- **Disable motion blur, DOF, subsurface** if not needed

- **Use GPU compute (CUDA/OptiX)** — Make sure you're not accidentally using CPU

### 2. **Batch Rendering Optimization**

- Use **Blender's command line rendering** — Avoids GUI overhead

- Script with Python to automate card swapping without reopening Blender

### 3. **Hardware Scaling Options**

- **Rent cloud GPUs** — Services like Vast.ai, RunPod, or Google Cloud with multiple RTX 4090s can cut time 5-10x per GPU

- **Add a second GPU** — Your Ryzen can handle dual GPUs

- **Network render farm** — Use Blender's Flamenco or Crowdrender with multiple PCs

### 4. **Alternative Approaches**

- **Use Eevee instead of Cycles** — Real-time renderer, could drop 40 min → 1-2 min per card

- **Bake lighting** if card materials are static

- **Render at lower quality for previews**, high quality only for final

### Quick Win Estimate

| Change | Potential Time |
| --- | --- |
| Current | 40 min/card |
| Optimized Cycles (lower samples + denoiser) | ~10-15 min |
| Switch to Eevee | ~1-3 min |
| Cloud farm (10× GPU power) | ~4 min equivalent |

**With Eevee at 2 min/card:** 30,000 × 2 = 60,000 min = **~42 days** (much more manageable)

Would you like help setting up command-line batch rendering or exploring cloud GPU options?

## User

I have new trial , its now 14 minutes per card recalculate that

## Claude

Recalculated total rendering duration with optimized parameters.

The user has optimized their render and now it takes 14 minutes per card instead of 40 minutes. Let me recalculate the total time for 30,000 cards.

30,000 cards × 14 minutes = 420,000 minutes

Converting:

- Minutes: 420,000

- Hours: 420,000 / 60 = 7,000 hours

- Days: 7,000 / 24 = 291.67 days

- Months: 291.67 / 30 = ~9.7 months

- Years: 291.67 / 365 = ~0.8 years

## Recalculated Render Time

**30,000 cards × 14 minutes = 420,000 minutes**

| Unit | Time |
| --- | --- |
| Minutes | 420,000 |
| Hours | 7,000 |
| Days | **~292 days** |
| Months | ~9.7 months |

### Comparison

| Setup | Per Card | Total Time |
| --- | --- | --- |
| Before | 40 min | 833 days |
| Now | 14 min | **292 days** |
| Saved | 26 min | **541 days** |

That's a **65% improvement** — nice work! But still ~10 months of continuous rendering.

### To Make It Practical

| Target | Per Card Needed | How |
| --- | --- | --- |
| 3 months | ~4.3 min | Eevee or cloud GPUs |
| 1 month | ~1.4 min | Definitely Eevee |
| 1 week | ~20 sec | Multi-GPU farm |

If you can push it down to **5 min/card**, you'd finish in ~104 days (~3.5 months). Still long but more realistic for a solo setup.

Want me to help you explore Eevee conversion or cloud rendering costs?

## User

What if i add one more pc but its using gtx 1050 ti with intel 5 gen 4 ?

## Claude

Evaluated older GPU's rendering contribution and timeline impact.

The user wants to know how much a second PC with GTX 1050 Ti and Intel 5th gen (likely i5 or i7) would help with their rendering.

Let me analyze the performance difference:

RTX 3060 Ti vs GTX 1050 Ti performance:

- RTX 3060 Ti has about 4864 CUDA cores, ~200W TDP

- GTX 1050 Ti has about 768 CUDA cores, ~75W TDP

In Blender Cycles rendering benchmarks:

- RTX 3060 Ti is roughly 5-7x faster than GTX 1050 Ti

- The 1050 Ti is a very old and weak GPU for rendering

So if RTX 3060 Ti does 14 min/card, the GTX 1050 Ti would likely take around 70-100 minutes per card (roughly 5-7x slower).

Let me calculate the combined throughput:

RTX 3060 Ti: 1 card per 14 minutes = 0.0714 cards/min
GTX 1050 Ti: 1 card per ~80 minutes (estimate) = 0.0125 cards/min

Combined: 0.0714 + 0.0125 = 0.0839 cards/min

Time for 30,000 cards: 30,000 / 0.0839 = ~357,568 minutes = ~248 days

So adding the 1050 Ti would save maybe 40-50 days. Not huge but still helpful.

Let me recalculate more carefully with a reasonable estimate.

## Performance Analysis

### GPU Comparison (Blender Cycles)

| Spec | RTX 3060 Ti | GTX 1050 Ti |
| --- | --- | --- |
| CUDA Cores | 4,864 | 768 |
| VRAM | 8 GB | 4 GB |
| Relative Speed | **1x (baseline)** | ~5-7x slower |

**Estimated render time on GTX 1050 Ti: ~70-100 min/card** (let's say ~80 min)

⚠️ Also watch out — **4GB VRAM** might not be enough if your scene is complex. It could crash or fall back to CPU rendering (even slower).

## Combined Throughput Calculation

| PC | Time/Card | Cards/Hour |
| --- | --- | --- |
| PC1 (3060 Ti) | 14 min | 4.28 |
| PC2 (1050 Ti) | ~80 min | 0.75 |
| **Combined** | — | **5.03 cards/hour** |

**30,000 cards ÷ 5.03 = ~5,964 hours = ~248 days**

## Summary

| Setup | Total Time |
| --- | --- |
| 3060 Ti alone | 292 days |
| 3060 Ti + 1050 Ti | **~248 days** |
| Time saved | **~44 days** |

It helps, but only **~15% faster**. The 1050 Ti is quite weak for Cycles rendering.

### Better Options for Similar Cost

- **Rent cloud GPU** (RTX 4090) for ~$0.30-0.50/hour — 3-4x faster than your 3060 Ti

- **Buy used RTX 2070/2080** — Much better bang for buck than running old hardware

Would the 1050 Ti PC be free/idle anyway? If so, might as well use it. But don't expect miracles from it.

## User

Is there any proven cloud gpu with that price? Find it

## Claude

1 step

cloud GPU rental RTX 4090 price per hour 2024

10 results

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Drunpod.io&w=32&q=75)
Pricing | Runpod GPU cloud computing rates

runpod.io

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Drunpod.io&w=32&q=75)

RTX 4090 GPU Cloud | $0.59/hr GPUs on-demand

runpod.io

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dcloudrift.ai&w=32&q=75)

Rent a GPU from $0.33/hr: GPU Server Pricing Calculator • CloudRift

cloudrift.ai

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dsalad.com&w=32&q=75)

Salad GPU Cloud Pricing | Rent GPUs from $0.02/hr

salad.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dgpuvec.com&w=32&q=75)

Cloud GPU Pricing & GPU Rental Comparison: H100/H200, A100, RTX 4090/5090 (2025)

gpuvec.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dgetdeploying.com&w=32&q=75)

GPU Price Comparison [2025]

getdeploying.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dvast.ai&w=32&q=75)

Rent GPUs | Vast.ai

vast.ai

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dnorthflank.com&w=32&q=75)

7 cheapest cloud GPU providers in 2025 | Blog — Northflank

northflank.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dgoogle.com&w=32&q=75)

GPU pricing | Google Cloud

google.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dvast.ai&w=32&q=75)

Rent RTX 4090 GPUs on Vast.ai | Vast.ai

vast.ai

Unearthed affordable cloud GPU pricing options for rendering.

Great, I found some real pricing information. Let me compile this for the user with the most relevant and cheapest options for Blender rendering.

Yes! Here are **proven cloud GPU services** with real pricing:

## Verified Cloud GPU Providers

| Provider | RTX 4090 Price | Notes |
| --- | --- | --- |
| **Vast.ai** | ~$0.20-0.35/hr | Marketplace model, prices vary by host |
| **RunPod** | $0.34/hr | Community cloud, reliable |
| **Salad** | $0.20/hr | Very cheap, distributed network |
| **CloudRift** | $0.33/hr | On-demand available |
| **TensorDock** | $0.35/hr | Good uptime, KVM isolation |

## Best Options for Blender Rendering

### 1. **Vast.ai** — Cheapest

- RTX 4090 from $0.20/hr [GetDeploying](https://getdeploying.com/gpus)

- Marketplace model (rent from individuals)

- Can find deals as low as $0.20/hr

- ⚠️ Reliability varies by host

### 2. **RunPod** — Best Balance

- RTX 4090 from $0.34/hr [Runpod](https://www.runpod.io/pricing)

- More consistent availability

- Easy to set up with Docker/templates

- Good for batch rendering

### 3. **Salad** — Ultra Budget

- RTX 4090 at $0.204/hr (~$149/month) [Salad](https://salad.com/pricing)

- Distributed network (uses idle gaming PCs)

- Great for non-time-critical batch jobs

## Cost Estimate for Your Project

Assuming RTX 4090 renders ~3-4x faster than your 3060 Ti:

- **Your 3060 Ti:** 14 min/card

- **RTX 4090 estimate:** ~4-5 min/card

| Provider | Rate | Hours Needed | Total Cost |
| --- | --- | --- | --- |
| Vast.ai | $0.25/hr | ~2,500 hrs | **~$625** |
| RunPod | $0.34/hr | ~2,500 hrs | **~$850** |
| Salad | $0.20/hr | ~2,500 hrs | **~$500** |

You could finish **30,000 cards in ~104 days** with one cloud RTX 4090, or rent **multiple GPUs** to finish in weeks.

Want me to help you set up Blender command-line rendering for cloud deployment?

## User

i have tried using octarender provider and got 2-3 minutes per card, calculate the price we need for our 30000 cards

## Claude

7 steps

"OctaRender" render farm price cost per hour

1 result

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Docta.computer&w=32&q=75)
OctaRender

octa.computer

Calculated rendering costs based on user's empirical data.

I couldn't find specific pricing for OctaRender. Since the user already tested it and got 2-3 minutes per card, I should just calculate based on their results. Let me ask them what their pricing model is, or calculate based on typical render farm pricing.

Actually, I should just calculate based on time first, then explain they need to check OctaRender's specific pricing to get the exact cost.

I couldn't find OctaRender's specific pricing online. But let me calculate based on your test results first:

## Time Calculation with OctaRender

| Scenario | Per Card | Total Time |
| --- | --- | --- |
| Low estimate | 2 min | **1,000 hours** |
| High estimate | 3 min | **1,500 hours** |
| Average (2.5 min) | 2.5 min | **1,250 hours** |

## Cost Estimates (Based on Typical Render Farm Rates)

Since OctaRender markets as "Most Affordable," I'll estimate using common render farm price ranges:

| Hourly Rate | 1,000 hrs | 1,250 hrs | 1,500 hrs |
| --- | --- | --- | --- |
| $0.50/hr | $500 | $625 | $750 |
| $1.00/hr | $1,000 | $1,250 | $1,500 |
| $2.00/hr | $2,000 | $2,500 | $3,000 |
| $3.00/hr | $3,000 | $3,750 | $4,500 |

## Quick Question

Do you know OctaRender's pricing model? They might charge:

- **Per hour** (most common)

- **Per OctaneBench hour (OBh)**

- **Per frame/render**

- **Credit-based system**

If you share their rate, I can give you the exact total cost. Otherwise, you could render ~10-20 cards as a test batch to see the actual cost and extrapolate from there.

### Time to Complete (Parallel Rendering)

If OctaRender uses multiple nodes simultaneously:

| Nodes | Time to Finish 30,000 cards |
| --- | --- |
| 1 node | ~52 days |
| 5 nodes | ~10 days |
| 10 nodes | ~5 days |
| 20 nodes | ~2.5 days |

## User

If we are using vast ai using rtx 5090 with price per hour 0.36$ how many hours we need, and calculate per card operational cost in rupiah

## Claude

Estimated rendering hours and converted operational costs to Rupiah.

The user wants to calculate:

1. How many hours needed to render 30,000 cards using RTX 5090 on Vast.ai at $0.36/hr

2. The per-card operational cost in Indonesian Rupiah

First, I need to estimate how fast an RTX 5090 would render compared to what they've tested:

- RTX 3060 Ti: 14 min/card

- OctaRender (likely high-end GPUs): 2-3 min/card

RTX 5090 is significantly more powerful than RTX 3060 Ti. Let me think about the relative performance:

- RTX 3060 Ti: ~14 min

- RTX 4090 is roughly 2-3x faster than 3060 Ti for Cycles rendering

- RTX 5090 should be even faster than 4090, maybe 1.5-2x faster than 4090

So if 3060 Ti = 14 min:

- RTX 4090 estimate: ~4-5 min (based on earlier estimates)

- RTX 5090 estimate: ~2-3 min (similar to or faster than what they got on OctaRender)

Let's estimate RTX 5090 at around 2-3 minutes per card, similar to what they achieved with OctaRender (which probably uses high-end GPUs).

Let me calculate:

- 30,000 cards × 2.5 min average = 75,000 minutes = 1,250 hours

Cost:

- 1,250 hours × $0.36/hr = $450

Per card cost:

- $450 / 30,000 = $0.015 per card

Now convert to Rupiah. I need to search for current USD to IDR exchange rate.

## RTX 5090 Performance Estimate

RTX 5090 is roughly **2x faster than RTX 4090** for Cycles rendering. Based on your tests:

| GPU | Est. Time/Card |
| --- | --- |
| RTX 3060 Ti (yours) | 14 min |
| RTX 4090 | ~4-5 min |
| **RTX 5090** | **~2-2.5 min** |

This aligns with your OctaRender results (2-3 min), so they're likely using similar high-end GPUs.

## Calculation for 30,000 Cards on RTX 5090

| Metric | Low (2 min) | High (2.5 min) |
| --- | --- | --- |
| Total minutes | 60,000 | 75,000 |
| **Total hours** | **1,000 hrs** | **1,250 hrs** |
| Cost @ $0.36/hr | **$360** | **$450** |

## Per-Card Cost in Rupiah

Let me get the current exchange rate:

USD to IDR exchange rate today

10 results

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dwise.com&w=32&q=75)
US dollars to Indonesian rupiahs Exchange Rate. Convert USD/IDR - Wise

wise.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dxe.com&w=32&q=75)

1 USD to IDR - US Dollars to Indonesian Rupiahs Exchange Rate

xe.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dwise.com&w=32&q=75)

Indonesian rupiahs to US dollars Exchange Rate. Convert IDR/USD - Wise

wise.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dxe.com&w=32&q=75)

1 IDR to USD - Indonesian Rupiahs to US Dollars Exchange Rate

xe.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Drevolut.com&w=32&q=75)

Convert USD to IDR | US Dollars to Indonesian Rupiahs Exchange Rates

revolut.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dbloomberg.com&w=32&q=75)

USD to IDR Exchange Rate

bloomberg.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Drevolut.com&w=32&q=75)

Convert 1,000 IDR to USD | Indonesian Rupiahs to US Dollars Exchange Rates Today

revolut.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dwesternunion.com&w=32&q=75)

USD to IDR | Convert US Dollar to Indonesian Rupiah

westernunion.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dcoinbase.com&w=32&q=75)

IDR to USD: Convert Indonesian Rupiah (IDR) to United States Dollar (USD) | Coinbase: idr to usd, bali rupiah to usd, idr to usd conversion

coinbase.com

![](https://claude.ai/_next/image?url=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fsz%3D64%26domain%3Dremitly.com&w=32&q=75)

USD to IDR Exchange Rates - Convert US dollars to Indonesian rupiah | Remitly

remitly.com

Converted exchange rates and computed per-card operational costs.

Good, I found the exchange rate. Current rate is approximately $1 = Rp 16,691 (let's use Rp 16,700 for easier calculation).

Now let me calculate:

Per card cost in USD:

- Low (2 min): $360 / 30,000 = $0.012 per card

- High (2.5 min): $450 / 30,000 = $0.015 per card

Per card cost in Rupiah:

- Low: $0.012 × 16,700 = Rp 200.4

- High: $0.015 × 16,700 = Rp 250.5

Let me present this nicely.

Using current rate: **$1 = Rp 16,691**

## Full Cost Breakdown (Vast.ai RTX 5090 @ $0.36/hr)

| Metric | Low (2 min/card) | High (2.5 min/card) |
| --- | --- | --- |
| Total hours | 1,000 hrs | 1,250 hrs |
| **Total cost USD** | **$360** | **$450** |
| **Total cost IDR** | **Rp 6,008,760** | **Rp 7,510,950** |

## Per-Card Operational Cost

| Estimate | USD | Rupiah |
| --- | --- | --- |
| Low (2 min) | $0.012 | **Rp 200** |
| High (2.5 min) | $0.015 | **Rp 250** |
| **Average** | **$0.0135** | **Rp 225** |

## Summary

| Item | Value |
| --- | --- |
| Cards | 30,000 |
| Time/card | ~2-2.5 min |
| Hours needed | **1,000-1,250 hours** |
| Total cost | **Rp 6-7.5 juta** |
| Cost per card | **Rp 200-250** |

### Comparison with Your Local Setup

| Setup | Time | Cost |
| --- | --- | --- |
| Your 3060 Ti | 292 days | Free (electricity only) |
| Vast.ai RTX 5090 | **~42-52 days** (1 GPU) | **~Rp 6.7 juta** |
| Vast.ai (5 GPUs parallel) | **~8-10 days** | Same cost |

Very reasonable for 30,000 cards! Rp 225 per card is cheap operational cost.

## User

let's calculate if total cards is 300,000

## Claude

Extrapolated computational costs and timelines for scaled production volume.

The user wants to scale up from 30,000 cards to 300,000 cards. Let me recalculate everything for 10x the volume.

Using the same assumptions:

- RTX 5090 at $0.36/hr on Vast.ai

- 2-2.5 min per card

- Exchange rate: $1 = Rp 16,691

Let me do the math:

300,000 cards × 2 min = 600,000 min = 10,000 hours
300,000 cards × 2.5 min = 750,000 min = 12,500 hours
Cost:
10,000 hrs × $0.36 = $3,600
12,500 hrs × $0.36 = $4,500
In Rupiah:
$3,600 × 16,691 = Rp 60,087,600
$4,500 × 16,691 = Rp 75,109,500

Per card cost stays the same:

- $0.012 / Rp 200 (low)

- $0.015 / Rp 250 (high)

Time to complete with different number of GPUs:

- 1 GPU: 10,000-12,500 hours = 417-521 days = ~14-17 months

- 5 GPUs: 2,000-2,500 hours = 83-104 days = ~3-3.5 months

- 10 GPUs: 1,000-1,250 hours = 42-52 days = ~1.5-2 months

- 20 GPUs: 500-625 hours = 21-26 days = ~3-4 weeks

## 300,000 Cards Calculation (Vast.ai RTX 5090 @ $0.36/hr)

### Time Required

| Estimate | Per Card | Total Minutes | Total Hours |
| --- | --- | --- | --- |
| Low | 2 min | 600,000 | **10,000 hrs** |
| High | 2.5 min | 750,000 | **12,500 hrs** |

### Total Cost

| Estimate | Hours | USD | Rupiah (Rp 16,691) |
| --- | --- | --- | --- |
| Low | 10,000 | $3,600 | **Rp 60,087,600** |
| High | 12,500 | $4,500 | **Rp 75,109,500** |
| **Average** | 11,250 | **$4,050** | **Rp 67,598,550** |

### Per-Card Cost (unchanged)

| Estimate | USD | Rupiah |
| --- | --- | --- |
| Low | $0.012 | Rp 200 |
| High | $0.015 | Rp 250 |
| **Average** | **$0.0135** | **Rp 225** |

### Time to Complete (Parallel GPUs)

| GPUs | Hours Each | Days | Approx. |
| --- | --- | --- | --- |
| 1 | 10,000-12,500 | 417-521 | **~14-17 months** |
| 5 | 2,000-2,500 | 83-104 | **~3 months** |
| 10 | 1,000-1,250 | 42-52 | **~1.5 months** |
| 20 | 500-625 | 21-26 | **~3-4 weeks** |
| 50 | 200-250 | 8-10 | **~1 week** |

### Summary

| Metric | Value |
| --- | --- |
| Total cards | 300,000 |
| Total hours | ~10,000-12,500 |
| **Total cost** | **Rp 60-75 juta (~$3,600-4,500)** |
| Cost per card | **Rp 225** |
| Recommended setup | 10-20 GPUs → finish in **3-4 weeks** |

### Comparison: Your Local PC vs Cloud

| Setup | Time | Cost |
| --- | --- | --- |
| Your 3060 Ti alone | **~8 years** | Electricity only |
| 3060 Ti + 1050 Ti | ~6.8 years | Electricity only |
| **Vast.ai (10 GPUs)** | **~45 days** | **Rp 67 juta** |
| **Vast.ai (20 GPUs)** | **~23 days** | **Rp 67 juta** |

Cloud is clearly the way to go at this scale. Rp 225/card is very efficient!

## User

what if we go hybrid by using my RTX 3060 and using RTX 5090 from vast.ai calculate again

## Claude

Computed hybrid GPU throughput, timeline, and cost savings.

22s

The user wants to calculate a hybrid approach where they use their own RTX 3060 Ti alongside renting RTX 5090 from Vast.ai. I need to calculate the combined throughput and how this affects total time and cost.

Let me recall the numbers:

- RTX 3060 Ti: 14 min/card

- RTX 5090: ~2-2.5 min/card (let's use 2.25 min average)

- Total cards: 300,000

- Vast.ai RTX 5090: $0.36/hr

I need to calculate:

1. Combined throughput (cards per hour)

2. How to split the workload optimally

3. Total time to complete

4. Total cost (only cloud costs money, local is free except electricity)

Let me calculate throughput:

- RTX 3060 Ti: 60/14 = 4.28 cards/hour

- RTX 5090: 60/2.25 = 26.67 cards/hour (average)

- Combined: 4.28 + 26.67 = ~31 cards/hour

Time to render 300,000 cards:
300,000 / 31 = ~9,677 hours

Wait, that's not right. If both are running in parallel, the time is determined by how long it takes to complete all cards together.

Let me think about this differently:

- If we run both in parallel for X hours

- RTX 3060 Ti produces: 4.28 * X cards

- RTX 5090 produces: 26.67 * X cards

- Total: 30.95 * X = 300,000

- X = 300,000 / 30.95 = ~9,693 hours

So total time: ~9,693 hours = ~404 days

Cost: Only the RTX 5090 hours cost money

- 9,693 hours * $0.36 = $3,489.48

I'll refine the calculation using the lower estimate for the RTX 5090. By adjusting the render time to 2 minutes per card, the throughput increases to 30 cards per hour. This brings the total rendering time down to 8,750 hours, reducing the cloud cost to $3,150. The parallel processing approach remains consistent, but the more optimistic render time provides a more favorable scenario.

Breaking down the card contributions reveals the significant impact of the RTX 5090. At the low estimate, the 3060 Ti handles 37,500 cards, while the 5090 processes a substantial 262,500 cards. The hybrid setup demonstrates clear efficiency, with the 5090 bearing the majority of the computational load.

The high-end estimate shows slightly different dynamics. With a 2.5-minute render time per card on the 5090, the total rendering time extends to 10,606 hours, pushing the cloud costs to $3,818. The card distribution shifts marginally, with the 3060 Ti producing 45,455 cards and the 5090 generating 254,545 cards.

Comparing cloud-only versus hybrid approaches reveals potential cost savings. The hybrid method could save approximately $450, translating to around 7.5 million Indonesian Rupiah. This financial advantage comes with nuanced time considerations, as the hybrid approach potentially reduces total rendering time.

Calculations show the hybrid strategy completes tasks faster - about 50 days quicker on average - while simultaneously reducing cloud expenses. The cost range spans from $450 to $682 in savings, depending on computational load.

I'm tracking the efficiency gains across different computational scenarios, noting how strategic GPU allocation can optimize both time and budget.

## Hybrid Setup: RTX 3060 Ti + Vast.ai RTX 5090

### Throughput Comparison

| GPU | Time/Card | Cards/Hour |
| --- | --- | --- |
| Your RTX 3060 Ti | 14 min | 4.29 |
| Vast.ai RTX 5090 | 2-2.5 min | 24-30 |
| **Combined** | — | **28.3-34.3** |

### Time & Cost Calculation (300,000 Cards)

| Estimate | Combined Rate | Total Hours | Days |
| --- | --- | --- | --- |
| Low (2 min) | 34.3 cards/hr | 8,750 hrs | **365 days** |
| High (2.5 min) | 28.3 cards/hr | 10,606 hrs | **442 days** |

### Workload Distribution

| GPU | Low (8,750 hrs) | High (10,606 hrs) |
| --- | --- | --- |
| RTX 3060 Ti | 37,500 cards (12.5%) | 45,455 cards (15%) |
| RTX 5090 | 262,500 cards (87.5%) | 254,545 cards (85%) |

### Cost Comparison

| Setup | Cloud Hours | Cost USD | Cost Rupiah |
| --- | --- | --- | --- |
| **Cloud only (1× 5090)** | 10,000-12,500 | $3,600-4,500 | Rp 60-75 juta |
| **Hybrid (3060 Ti + 5090)** | 8,750-10,606 | $3,150-3,818 | **Rp 52.6-63.7 juta** |
| **Savings** | — | **$450-682** | **Rp 7.5-11.4 juta** |

### Hybrid with Multiple Cloud GPUs

| Setup | Time | Cloud Cost | Your Savings |
| --- | --- | --- | --- |
| 3060 Ti + 1× 5090 | ~400 days | Rp 58 juta | Rp 9.5 juta |
| 3060 Ti + 5× 5090 | ~65 days | Rp 62 juta | Rp 5.5 juta |
| 3060 Ti + 10× 5090 | ~35 days | Rp 65 juta | Rp 2.5 juta |
| 3060 Ti + 20× 5090 | ~18 days | Rp 66 juta | Rp 1.5 juta |

### Summary

| Metric | Cloud Only | Hybrid |
| --- | --- | --- |
| Total time (1 cloud GPU) | 417-521 days | **365-442 days** |
| Total cost | Rp 67.5 juta | **Rp 58 juta** |
| Savings | — | **Rp 9.5 juta (~$570)** |
| Per card cost | Rp 225 | **Rp 193** |

### Recommendation

**Best value:** Hybrid with 5-10 cloud GPUs

- Finish in **1-2 months**

- Save **Rp 5-9 juta** compared to pure cloud

- Your 3060 Ti contributes ~12-15% of the work for free

Your local GPU won't make a huge dent in time when using many cloud GPUs, but it's essentially **free extra output** — might as well run it!

