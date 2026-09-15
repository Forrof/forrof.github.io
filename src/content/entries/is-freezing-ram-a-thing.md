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

So, where does DRAM store the data? Unlike persistent storage, DRAM represents data temporarily as electrical charge inside tiny memory cells.

<a href="/images/is-freezing-ram-a-thing/capa.jpg" target="_blank" rel="noopener noreferrer" class="ff-image-link" aria-label="Open full-size image: Capa"><img src="/images/is-freezing-ram-a-thing/capa.jpg" alt="Capa" width="550" height="481" loading="lazy" decoding="async" /></a>


A higher and a lower charge state represent two distinguishable states. The memory system interprets those states as binary data. A charged state does not universally mean `1`, though; the logical value depends on how the particular cell is organized.

$$
Q = C V
$$

where:

| Symbol | Meaning |
|---|---|
| $Q$ | Electrical charge in the cell |
| $C$ | Capacitance of the storage capacitor |
| $V$ | Voltage across the capacitor |


These capacitors might seem like the best components ever, but they are not. The stored charge gradually leaks away through several semiconductor leakage paths, so the voltage difference that represents the stored state decreases over time.

That is why the **D** in DRAM means *dynamic*: the memory controller periodically commands the DRAM to **refresh** its rows, allowing the chip's internal sensing circuitry to detect and restore the stored charge.

---

## 2. Why losing power isn't the same as erasing data

When power disappears, the memory controller can no longer keep the DRAM refreshed. However, the storage capacitors are not necessarily shorted to ground or deliberately overwritten. Their existing charge simply begins to decay through leakage paths.

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

In the paper I saw, Halderman and colleagues demonstrated this experimentally in *Lest We Remember*. They found that ordinary DRAM often retained useful information for several seconds at normal operating temperatures. When cooled, it retained data far longer. At approximately $-50^\circ\text{C}$, fewer than 1% of bits decayed after ten minutes in their reported tests. With liquid nitrogen, one experiment showed only about 0.17% decay after an hour.[^halderman]

So yeah, you can technically move a powered-off DIMM and recover some of what was in it—but it isn't as simple as plugging it into another PC and opening some files. The remaining contents have to be acquired before decay or hardware initialization destroys too much of the data.

<a href="/images/is-freezing-ram-a-thing/Luigui.jpg" target="_blank" rel="noopener noreferrer" class="ff-image-link" aria-label="Open full-size image: Luigui"><img src="/images/is-freezing-ram-a-thing/Luigui.jpg" alt="Luigui" width="800" height="774" loading="lazy" decoding="async" /></a>


---

## 3. Why cooling makes a difference
The total leakage from a DRAM cell comes from several physical mechanisms, including:

- semiconductor junction leakage;
- transistor subthreshold leakage;
- gate-induced drain leakage;
- trap-assisted leakage; and
- at very low temperatures, mechanisms such as tunnelling.

Several of these processes are **temperature-dependent**. Higher temperatures give charge carriers more thermal energy, increasing the probability that charge escapes the storage node. Cooling reduces that activity and therefore reduces leakage.


$$
I_{\text{leak}} \propto e^{-E_a/(k_B T)}
$$

and, correspondingly:

$$
t_{\text{retention}} \propto e^{E_a/(k_B T)}
$$

where $E_a$ is an effective activation energy, $k_B$ is Boltzmann's constant, and $T$ is absolute temperature.


The equations should not be taken as a universal law for every DRAM cell. Real chips contain billions of cells with manufacturing variations, multiple leakage paths, and changing dominant mechanisms.

Basically, what this means is that low temperatures reduce charge leakage, allowing the difference between the cell's charge states to remain distinguishable for longer. That makes the "data" survive longer.

<a href="/images/is-freezing-ram-a-thing/CoolRam.jpg" target="_blank" rel="noopener noreferrer" class="ff-image-link" aria-label="Open full-size image: CoolRam"><img src="/images/is-freezing-ram-a-thing/CoolRam.jpg" alt="CoolRam" width="750" height="751" loading="lazy" decoding="async" /></a>


---

## 4. Memory decay is not simply random

If every bit immediately became a random `0` or `1`, recovery would be trash. Experiments instead show two helpful properties:

### Cells decay at different rates

Tiny manufacturing differences mean that some cells retain their state longer than others. Decay develops progressively across a module rather than appearing everywhere at once.

### Many cells decay toward a preferred state

Depending on their physical organization, cells often settle toward a predictable **ground state**. That ground state may appear as a logical `0` or `1`. Halderman et al. found that both the eventual value and the approximate decay order of many cells were repeatable.[^halderman]

So a damaged image can be closer to:

> **original data + patterned bit errors**

rather than completely random garbage.

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

These percentages should not be interpreted as universal retention rates for DDR3. They are results from this particular experimental setup, and retention behavior can vary significantly between memory modules, systems, timings, and acquisition methods.

The authors also reported recovering TrueCrypt-related encryption material from cooled-memory images.[^gupta]

Photos of the real experiment (Obviously not real):
![fancoool](/images/is-freezing-ram-a-thing/fancoool.png)



---

## 7. Does this still matter with DDR3 and DDR4?

Modern memory controllers may **scramble** the data written to memory. This is mainly done to improve electrical behavior, such as reducing problematic signal patterns and electrical noise. Scrambling is **not encryption**.

Bauer, Gruhn, and Freiling showed in 2016 that Intel DDR3 scrambling could be reversed with a small amount of known plaintext, enabling reconstruction of acquired memory images.[^bauer]

In 2017, Yitbarek and colleagues analyzed the enhanced DDR4 memory scrambler used in Intel Skylake processors and demonstrated that it still did not provide cryptographic confidentiality against cold-boot attacks.[^yitbarek]

---

## 8. But modern memory encryption changes the game

Memory scrambling should not be confused with **cryptographic memory encryption**.

Some modern processors support technologies that encrypt the contents of DRAM using keys kept inside the processor. Examples include Intel Total Memory Encryption (**TME**) and AMD Secure Memory Encryption / Transparent Secure Memory Encryption (**SME/TSME**).[^intel-tme][^amd-sme]

With these protections enabled, physically recovering the contents of the DIMMs does not automatically reveal the original plaintext data, because what is stored in external memory is encrypted.

That means:

> **cold-boot attacks are still a real physical phenomenon, but whether they are useful against a modern system depends heavily on the hardware, firmware, memory-encryption features, and system configuration.**

So no, freezing RAM is not some ancient computer myth.

But also no, putting every modern RAM stick in a freezer does not magically dump everyone's encryption keys.

Tragic.

---

## References

[^gupta]: K. Gupta and A. Nisbet, “[Memory Forensic Data Recovery Utilising RAM Cooling Methods](https://ro.ecu.edu.au/adf/162/),” *Proceedings of the 14th Australian Digital Forensics Conference*, 2016. DOI: [10.4225/75/58a54cc3c64a2](https://doi.org/10.4225/75/58a54cc3c64a2).

[^halderman]: J. A. Halderman et al., “[Lest We Remember: Cold Boot Attacks on Encryption Keys](https://www.usenix.org/conference/17th-usenix-security-symposium/presentation/lest-we-remember-cold-boot-attacks-encryption),” *17th USENIX Security Symposium*, 2008. [Full paper (PDF)](https://www.usenix.org/legacy/events/sec08/tech/full_papers/halderman/halderman.pdf).

[^bauer]: J. Bauer, M. Gruhn, and F. Freiling, “[Lest We Forget: Cold-Boot Attacks on Scrambled DDR3 Memory](https://doi.org/10.1016/j.diin.2016.01.009),” *Digital Investigation*, vol. 16, pp. S65–S74, 2016.

[^yitbarek]: S. F. Yitbarek, M. T. Aga, R. Das, and T. Austin, “[Cold Boot Attacks Are Still Hot: Security Analysis of Memory Scramblers in Modern Processors](https://salessa.github.io/),” *2017 IEEE International Symposium on High Performance Computer Architecture (HPCA)*, 2017.

[^nist]: National Institute of Standards and Technology, “[Advanced Encryption Standard (AES), FIPS 197](https://csrc.nist.gov/pubs/fips/197/final),” updated 2023.

[^intel-tme]: Intel, “[Intel Total Memory Encryption](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/white-paper-intel-tme.pdf),” white paper.

[^amd-sme]: AMD, “[Enhance Your Cloud Security with AMD EPYC Hardware Memory Encryption](https://www.amd.com/content/dam/amd/en/documents/epyc-business-docs/white-papers/cloud-security-epyc-hardware-memory-encryption.pdf),” white paper.

### Editorial note

The physical explanation in this article is grounded primarily in Halderman et al.'s experimental characterization of DRAM remanence. Gupta and Nisbet provide the applied forensic comparison of cooling methods. The DDR3- and DDR4-era papers show why memory scrambling should not be confused with cryptographic memory protection. Modern hardware memory-encryption technologies further change the practical threat model by encrypting data stored in external memory.
