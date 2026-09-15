---
title: "Is freezing RAM a thing?????"
summary: "What cooling does to DRAM, why memory can outlast a power cut, and what cold-boot research found."
published: "2026-09-15"
type: entry
tags: [hardware, ram, memory-forensics]
---

![FrozonoHacker](/images/is-freezing-ram-a-thing/FrozonoHacker.png)

<div class="ff-image-caption"><span aria-hidden="true">^<br />|</span><br />me fr</div>


I was navigating through the fascinating world of the internet and found a paper talking about how freezing RAM could make volatile memory retain its data.

Are these dudes telling me that, if I put my RAM on ice, I can move volatile data? To me, that sounds crazy.

<a href="/images/is-freezing-ram-a-thing/BrainBoom.jpg" target="_blank" rel="noopener noreferrer" class="ff-image-link" aria-label="Open full-size image: BrainBoom"><img src="/images/is-freezing-ram-a-thing/BrainBoom.jpg" alt="BrainBoom" width="1000" height="562" loading="lazy" decoding="async" /></a>

Surprise to nobody, I don't know anything about electronic components or circuits.

---

## 1. How does this work?
After trying to understand the science behind this, I can explain at a high level why this makes sense.

> **Disclaimer**
>I'm not an electrical engineer

So, where does RAM store the data? The answer to that is nowhere, really. RAM stores data as electrical charge in capacitors, which represent 1's and 0's depending on whether they have charge or not.

A charged and an uncharged capacitor represent two distinguishable states. The memory system interprets those states as binary data.

$$
Q = C V
$$

where:

| Symbol | Meaning |
|---|---|
| $Q$ | Electrical charge in the cell |
| $C$ | Capacitance of the storage capacitor |
| $V$ | Voltage across the capacitor |


These capacitors might seem like the best components ever, but they are not. They leak charge over time, so the voltage goes down.

That is why the **D** in DRAM means *dynamic*: the memory controller must repeatedly read and restore—or **refresh**—the cells while the system is operating.

---

## 2. Why losing power isn't the same as erasing data

When power disappears, the memory controller can no longer refresh the DRAM. However, the storage capacitors are not necessarily shorted to ground or deliberately overwritten. They simply begin losing their existing charge through leakage paths.

That creates a short period during which some cells can still be interpreted correctly.

A simplified estimate of retention time is:

$$
t_{\text{retention}} \approx \frac{C\,\Delta V}{I_{\text{leak}}}
$$

where:

| Term | Interpretation |
|---|---|
| $C$ | How much charge the cell can hold per volt |
| $\Delta V$ | How much voltage loss the sense circuitry can tolerate |
| $I_{\text{leak}}$ | Total current leaking from the storage node |

> **Disclaimer**
>This equation is a simplification, but it makes the relationship clear.

In the paper I saw, Halderman and colleagues demonstrated this experimentally in *Lest We Remember*. They found that ordinary DRAM often retained useful information for several seconds at normal temperatures. When cooled, it retained data far longer. At approximately $-50^\circ\text{C}$, fewer than 1% of bits decayed after ten minutes in their reported tests. With liquid nitrogen, one experiment showed only about 0.17% decay after an hour.[^halderman]

---

## 3. Why cooling makes a difference
The total leakage from a DRAM cell comes from several physical mechanisms, including:

- semiconductor junction leakage;
- transistor subthreshold leakage;
- gate-induced drain leakage;
- trap-assisted leakage; and
- at very low temperatures, mechanisms such as tunnelling.

Several of these processes are **temperature-dependent**. Higher temperatures give charge carriers more thermal energy, increasing the probability that they escape the storage node. Cooling reduces that activity and therefore reduces leakage.


$$
I_{\text{leak}} \propto e^{-E_a/(k_B T)}
$$

and, correspondingly:

$$
t_{\text{retention}} \propto e^{E_a/(k_B T)}
$$

where $E_a$ is an effective activation energy, $k_B$ is Boltzmann's constant, and $T$ is absolute temperature.


The equations should not be taken as a universal law for every DRAM cell. Real chips contain billions of cells with manufacturing variations, multiple leakage paths, and changing dominant mechanisms.

Basically, what this means is that low temperatures reduce the amount of charge leakage, resulting in capacitors staying charged for longer and retaining more voltage, making the "data" survive longer.

---

## 4. Memory decay is not random

If every bit immediately became a random `0` or `1`, recovery would be trash. Experiments instead show two helpful properties:

### Cells decay at different rates

Tiny manufacturing differences mean that some cells retain charge longer than others. Decay develops progressively across a module rather than appearing everywhere at once.

### Many cells decay toward a preferred state

Depending on their physical organization, cells often settle toward a predictable **ground state**. That ground state may appear as a logical `0` or `1`. Halderman et al. found that both the eventual value and the approximate decay order of many cells were repeatable.[^halderman]

So a damaged image can be closer to:

> **original data + patterned bit errors**

---

## 5. Why partially damaged RAM can still expose keys

Cryptographic programs often keep more than the original key in RAM. For performance, they may store an **expanded key schedule**: a larger structure mathematically derived from the key.

That structure contains redundancy. If part of a key schedule has decayed, an analysis tool can test candidate values against the mathematical relationships that a valid schedule must satisfy.

Halderman et al. developed methods for locating AES key schedules and correcting decay errors. Their experiments showed that useful key recovery did not always require a perfectly preserved memory image.[^halderman]

---

## 6. EXPERIMENTATIOOOOON!!!!!!

The 2016 paper by Kedar Gupta and Alastair Nisbet, *Memory Forensic Data Recovery Utilising RAM Cooling Methods*, explored whether different cooling methods could preserve useful data during forensic memory acquisition.[^gupta]

Their test system used **1 GB of DDR3 non-ECC memory**. They compared an uncooled baseline with three cooling methods and reported the following approximate recovery after a ten-minute delay:

| Condition | Reported temperature | Reported recovery after 10 minutes |
|---|---:|---:|
| No cooling | About $35^\circ\text{C}$ | 0.2% |
| Liquid nitrogen | About $-196^\circ\text{C}$ | 99.81% |
| Freezing spray | About $-40^\circ\text{C}$ | 96.45% |
| Ice | About $10^\circ\text{C}$ | 99.71% |

The authors also reported recovering TrueCrypt-related encryption material from cooled-memory images.[^gupta]

---

## 7. Does this still matter with DDR3 and DDR4?

Modern memory controllers may **scramble** the data written to memory. This is mainly done to improve electrical behavior. (It solves problematic bit patterns or something like that...)

Bauer, Gruhn, and Freiling showed in 2016 that Intel DDR3 scrambling could be reversed with a small amount of known plaintext, enabling reconstruction of acquired memory images.[^bauer] In 2017, Yitbarek and colleagues analyzed memory scramblers in newer Intel systems and demonstrated that scrambling did not provide cryptographic confidentiality against cold-boot analysis.[^yitbarek]

---

## References

[^gupta]: K. Gupta and A. Nisbet, “[Memory Forensic Data Recovery Utilising RAM Cooling Methods](https://ro.ecu.edu.au/adf/162/),” *Proceedings of the 14th Australian Digital Forensics Conference*, 2016. DOI: [10.4225/75/58a54cc3c64a2](https://doi.org/10.4225/75/58a54cc3c64a2).

[^halderman]: J. A. Halderman et al., “[Lest We Remember: Cold Boot Attacks on Encryption Keys](https://www.usenix.org/conference/17th-usenix-security-symposium/presentation/lest-we-remember-cold-boot-attacks-encryption),” *17th USENIX Security Symposium*, 2008. [Full paper (PDF)](https://www.usenix.org/legacy/events/sec08/tech/full_papers/halderman/halderman.pdf).

[^bauer]: J. Bauer, M. Gruhn, and F. Freiling, “[Lest We Forget: Cold-Boot Attacks on Scrambled DDR3 Memory](https://doi.org/10.1016/j.diin.2016.01.009),” *Digital Investigation*, vol. 16, pp. S65–S74, 2016.

[^yitbarek]: S. F. Yitbarek, M. T. Aga, R. Das, and T. Austin, “[Cold Boot Attacks Are Still Hot: Security Analysis of Memory Scramblers in Modern Processors](https://salessa.github.io/),” *2017 IEEE International Symposium on High Performance Computer Architecture (HPCA)*, 2017.

[^nist]: National Institute of Standards and Technology, “[Advanced Encryption Standard (AES), FIPS 197](https://csrc.nist.gov/pubs/fips/197/final),” updated 2023.

### Editorial note

The physical explanation in this article is grounded primarily in Halderman et al.'s experimental characterization of DRAM remanence. Gupta and Nisbet provide the applied forensic comparison of cooling methods. The DDR3- and DDR4-era papers show why memory scrambling should not be confused with cryptographic memory protection.
