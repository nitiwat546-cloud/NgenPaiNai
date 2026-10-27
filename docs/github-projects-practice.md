# ฝึกใช้ GitHub Projects แทน Jira ด้วย repo เงินไปไหน

ไฟล์นี้เป็นแบบฝึกหัดทีละขั้น ตั้งแต่ทำ product backlog → แบ่ง sprint → สร้าง issue → ใช้ Insights ดูความคืบหน้า โดยใช้ repo นี้เป็นสนามซ้อม
backlog ในข้อ 8 เป็นงานจริงของแอปนี้ ทำเสร็จแล้วปิด issue ได้จริง กราฟใน Insights จึงจะมีข้อมูลจริงให้ดู

> ข้อมูลอ้างอิงจากเอกสาร GitHub ณ ตุลาคม 2569 (2026) ฟีเจอร์นี้เปลี่ยนบ่อย จุดที่มีหมายเหตุ **"ลองเช็กเอง"** ให้ทดสอบกับบัญชีจริงก่อนไปสรุปให้ทีม

---

## 1. เทียบคำศัพท์ Jira → GitHub

| Jira | GitHub | หมายเหตุ |
|---|---|---|
| Project / Board | **Project** (ระดับ user หรือ org) | Project หนึ่งดึง issue จากหลาย repo ได้ |
| Epic | **Parent issue + sub-issues** | issue แม่แสดงความคืบหน้าของ sub-issue ให้เอง |
| Story / Task / Bug | **Issue** + **label** (`story` `task` `bug`) | **Issue types** ของจริงมีเฉพาะ repo ที่อยู่ใน organization |
| Story points | **ฟิลด์ Number** ที่สร้างเอง (เช่น `Points`) | ไม่มีให้ในตัว ต้องสร้างเอง |
| Sprint | **ฟิลด์ Iteration** (เช่น `Sprint`) | ตั้งความยาว วันเริ่ม และช่วงพักได้ |
| Status / Workflow | **ฟิลด์ Status** (single select) + **Workflows** | ย้ายสถานะอัตโนมัติได้บางส่วน เช่น ปิด issue แล้วย้ายไป Done |
| Backlog view | **Table view** ที่กรอง `no:sprint` | |
| Sprint board | **Board view** กรอง `sprint:@current` | |
| Roadmap / Timeline | **Roadmap view** | |
| Fix version / Release | **Milestone** | |
| Component | **Label** | |
| Sprint report / Burndown | **Insights** (charts) | มี **Burn up** ในตัว แต่**ไม่มี burndown สำเร็จรูป** (ดูข้อ 7) |
| Issue template | `.github/ISSUE_TEMPLATE/*.yml` (issue forms) | repo นี้มี template ให้แล้ว 3 แบบ |

---

## 2. เตรียม repo (ทำครั้งเดียว)

1. **สร้าง label**: ไปที่ repo → **Issues** → **Labels** → **New label** สร้าง `story`, `task`, `bug` (มี `bug` อยู่แล้ว) และ `epic`
   template ในโฟลเดอร์ `.github/ISSUE_TEMPLATE/` จะติด label เหล่านี้ให้อัตโนมัติ แต่ label ต้องมีอยู่ใน repo ก่อน
2. **ลองเปิด template**: ไปที่ **Issues** → **New issue** จะเห็น 3 แบบให้เลือก คือ **User story**, **Bug**, **Task**

---

## 3. สร้าง Project

1. ไปที่โปรไฟล์ GitHub ของตัวเอง → แท็บ **Projects** → **New project**
2. เลือก template **Team planning** หรือเริ่มจาก **Table** เปล่าก็ได้ ตั้งชื่อเช่น `เงินไปไหน – Dev`
3. เชื่อม Project กับ repo: ใน repo → แท็บ **Projects** → **Link a project** เลือก Project ที่เพิ่งสร้าง
4. **Settings** ของ Project (เมนู ⋯ มุมขวาบน) → ตั้งเป็น **Public** ถ้าไม่มีข้อมูลลับ
   เอกสาร GitHub ระบุว่า project แบบ public บันทึก chart ใน Insights ได้ไม่จำกัด ส่วนบัญชีฟรีแบบ private เคยจำกัดไว้ที่ 2 chart (**ลองเช็กเอง**)
5. จดเลข Project จาก URL ไว้ เช่น `github.com/users/pthanathon/projects/1` คือเลข `1`
   เอาไปใส่บรรทัด `projects:` ใน `.github/ISSUE_TEMPLATE/*.yml` ได้ issue ที่สร้างจาก template จะเข้า Project ให้เอง

---

## 4. สร้างฟิลด์ (เทียบได้กับการตั้งค่า board ใน Jira)

ใน Project → คลิกหัวคอลัมน์ **+** → **New field**

| ฟิลด์ | ชนิด | ค่า |
|---|---|---|
| `Status` | Single select (มีให้อยู่แล้ว) | แก้ตัวเลือกเป็น `Backlog`, `Ready`, `In progress`, `In review`, `Done` |
| `Priority` | Single select | `P0 ด่วน`, `P1 สำคัญ`, `P2 ทำเมื่อว่าง` |
| `Points` | Number | 1, 2, 3, 5, 8, 13 |
| `Sprint` | **Iteration** | ความยาว **1 สัปดาห์** เริ่ม **พุธ 28 ต.ค. 2569** (ฝึกแบบสั้นจะได้เห็นกราฟเร็ว ทีมจริงมักใช้ 2 สัปดาห์) |

หมายเหตุเรื่องฟิลด์ Iteration:
- สร้างแล้วจะได้ 3 iteration ให้ทันที ชื่อตั้งต้นคือ `Iteration 1-3` เปลี่ยนชื่อเป็น `Sprint 1-3` ได้ใน Settings
- ใส่ **break** (ช่วงพัก) คั่นระหว่าง sprint ได้ เช่น ช่วงสอบ

---

## 5. ทำ Product backlog

1. **สร้าง Epic**: ใช้ template **User story** หรือ issue เปล่าก็ได้ ตั้งชื่อเช่น `[Epic] เป้าเก็บเงิน` แล้วติด label `epic`
2. **สร้าง Story / Task / Bug** จาก template ตามรายการในข้อ 8
3. **ผูก story เข้ากับ Epic**: เปิด issue ของ Epic → **Create sub-issue** หรือ **Add existing issue** แล้วเลือก story
   Epic จะแสดงแถบความคืบหน้า เช่น 1 of 3 ให้เอง
4. **ใส่ issue เข้า Project**: เลือก Project ที่แถบขวาของ issue หรือพิมพ์ `#เลข` ที่แถวล่างสุดของตาราง
5. ใน Project ใส่ `Priority` กับ `Points` ให้ทุก story
6. **สร้าง view "Backlog"**: ใช้ Table view ตั้ง filter `no:sprint -status:Done` แล้วเรียงตาม **Priority** ตามด้วย **Points**
   view นี้คือ product backlog ที่เรียงลำดับแล้ว

---

## 6. Sprint planning และระหว่าง sprint

1. **Sprint planning**: ใน view Backlog ใส่ `Sprint = Sprint 1` ให้ story ด้านบนสุด ให้ผลรวม Points ไม่เกินกำลังทีม (ฝึกคนเดียวลองประมาณ 8 แต้ม/สัปดาห์)
   - เปิด **Field sum** ของคอลัมน์ Points ในเมนู view จะเห็นผลรวมแต้ม
2. **สร้าง view "Sprint board"**: เพิ่ม view ใหม่ เลือก layout **Board** ให้ column ตาม **Status** และตั้ง filter `sprint:@current`
   - เปิด **Field sum** ของ Points จะเห็นแต้มรวมของแต่ละคอลัมน์ คล้าย board ใน Jira
3. **สร้าง view "Roadmap"**: เลือก layout **Roadmap** แล้วใช้ `Sprint` เป็นแกนเวลา
4. **ตั้ง Workflows** (เมนู ⋯ → **Workflows**):
   - *Item added to project* → Status = `Backlog`
   - *Item closed* → Status = `Done` (เปิดไว้ตั้งแต่แรก)
   - *Pull request merged* → Status = `Done`
   - *Auto-add to project*: เพิ่ม issue ใหม่จาก repo นี้เข้า Project เอง ตั้ง filter ได้ เช่น `is:issue label:story,task,bug` (แผนฟรีสร้าง auto-add ได้จำนวนจำกัด **ลองเช็กเอง**)
   - **อย่าเปิด** *Auto-archive items* ระหว่างฝึก เพราะ Insights ไม่นับ item ที่ archive แล้ว กราฟจะหาย
5. **ระหว่าง sprint**: ลากการ์ดจาก Ready → In progress → Done หรือปิด issue ผ่าน commit/PR ที่เขียนว่า `Closes #12`
6. **จบ sprint**: งานที่ค้างให้ย้ายไป sprint ถัดไป วิธีคือ group view ตาม Sprint แล้วใช้คำสั่ง **move all items** ที่หัวกลุ่ม
   GitHub ไม่มีปุ่ม "Complete sprint" แบบ Jira sprint จะจบเองตามวันที่

---

## 7. Report: burn up และ burndown

**ข้อจำกัดที่ต้องบอกทีม: GitHub Projects ไม่มี burndown chart สำเร็จรูปแบบ Jira**
แต่ Insights มี chart 2 แบบ:

- **Current chart**: แสดงสถานะ *ตอนนี้* เช่น แต้มรวมต่อ sprint ใช้ทำ velocity ได้
- **Historical chart**: แสดงการเปลี่ยนแปลง *ตามเวลา* ตั้งต้นมีกราฟ **Burn up** ให้ (Open กับ Completed ซ้อนกัน)
  - เอกสาร GitHub รุ่นเก่าเขียนว่า historical chart ใช้ได้กับ **GitHub Team / Enterprise Cloud ของ organization** ส่วนเอกสารปัจจุบันไม่ได้ระบุ (**ลองเช็กเอง** ด้วยการเปิด Insights ดูว่ามีกราฟ Burn up ให้หรือไม่)

### 7.1 Sprint burn-up (ใช้แทน burndown)
1. Project → ไอคอน **Insights** (มุมขวาบน) → เปิด chart **Burn up**
2. ใส่ filter `sprint:@current` แล้ว **Save changes**
3. อ่านกราฟ: เส้นบนสุดคืองานทั้งหมดใน sprint ส่วนที่เป็น *Open* คือ "งานที่เหลือ" ซึ่งเท่ากับเส้น burndown นั่นเอง
   แต่ละวันที่ปิด issue ได้ ส่วน Open จะหดลง
4. ลองเปิด **Configure** แล้วดูว่าแกน Y เลือก **Sum of Points** ได้ไหม ถ้าได้จะเป็น burn-up ตามแต้ม ถ้าไม่ได้จะนับเป็นจำนวน issue (**ลองเช็กเอง**)

### 7.2 Velocity (แต้มที่ทำเสร็จต่อ sprint)
- **New chart** → Layout **Column** → X-axis **Sprint** → Group by **Status** → Y-axis **Sum of Points**
  แท่ง `Done` ของแต่ละ sprint คือ velocity

### 7.3 ถ้าทีมต้องการ burndown แบบมีเส้นอุดมคติจริงๆ
- ทางเลือก 1: ใช้ burn-up ข้างบนแทน อ่านส่วน Open เป็น "งานคงเหลือ"
- ทางเลือก 2: ใช้เครื่องมือเสริมที่อ่านข้อมูล GitHub Projects ได้ เช่น Screenful (เสียเงิน)
- ทางเลือก 3: เขียน GitHub Action ที่ดึงข้อมูลผ่าน GraphQL API ทุกวัน แล้ววาดกราฟเอง ทำได้แต่ต้องดูแลเอง

---

## 8. Product backlog ตัวอย่างของเงินไปไหน (ใช้ฝึกได้ทันที)

ทุกข้อเป็นงานจริงของแอปนี้ ที่มาคือ `PRODUCT.md` และสิ่งที่ผู้ตรวจงานบอกว่ายังไม่ได้ทดสอบ

### Epic A: เป้าเก็บเงิน
| # | ชนิด | ชื่อ | Points | Priority |
|---|---|---|---|---|
| A1 | Story | ตั้งเป้าเก็บเงินต่อเดือนในเมนู ⋯ | 3 | P1 |
| A2 | Story | แสดงความคืบหน้าเป้าเก็บเงิน (รายรับ − รายจ่าย เทียบกับเป้า) ในหน้าแรก | 5 | P1 |
| A3 | Story | สรุปท้ายเดือนว่าเก็บได้ตามเป้าไหม ด้วยข้อความแบบเพื่อน | 2 | P2 |

### Epic B: ใช้บนมือถือเหมือนแอปจริง
| # | ชนิด | ชื่อ | Points | Priority |
|---|---|---|---|---|
| B1 | Task | เปิด GitHub Pages ให้แอปมีลิงก์เข้าใช้จากมือถือ | 1 | P0 |
| B2 | Story | เพิ่ม web app manifest และไอคอน เพื่อ "เพิ่มไปยังหน้าจอหลัก" | 2 | P1 |
| B3 | Story | ใช้งานแบบออฟไลน์ด้วย service worker | 5 | P2 |
| B4 | Bug | ตรวจว่าคีย์บอร์ดมือถือบังปุ่ม "บันทึก" ในแผ่นจดหรือไม่ (ผู้ตรวจงานยังไม่ได้ทดสอบ) | 2 | P0 |

### Epic C: จดเร็วขึ้น
| # | ชนิด | ชื่อ | Points | Priority |
|---|---|---|---|---|
| C1 | Story | ปุ่มรายการที่จดบ่อย (เช่น "ข้าวมันไก่ 50") แตะครั้งเดียวจดได้เลย | 5 | P1 |
| C2 | Story | ค้นหารายการจากบันทึกช่วยจำ | 3 | P2 |
| C3 | Story | เพิ่มหรือแก้ชื่อหมวดเองได้ | 8 | P2 |

### Epic D: คุณภาพโค้ด
| # | ชนิด | ชื่อ | Points | Priority |
|---|---|---|---|---|
| D1 | Task | เขียน unit test ให้ `parseAmount` และการคำนวณงบ/รายจ่ายประจำ | 3 | P1 |
| D2 | Task | ตั้ง GitHub Actions ให้รันเทสต์ทุกครั้งที่ push | 2 | P2 |

รวม 12 งาน 41 แต้ม ถ้าทำได้ประมาณ 8 แต้ม/สัปดาห์ จะได้ประมาณ 5 sprint

**ตัวอย่างการแบ่ง Sprint 1 (28 ต.ค. – 3 พ.ย.)**: B1 (1) + B4 (2) + A1 (3) + B2 (2) = 8 แต้ม

---

## 9. สรุปสำหรับเล่าให้พี่เลี้ยงฟัง

**ข้อดีของ GitHub Projects**
- อยู่ที่เดียวกับโค้ด เชื่อม issue ↔ PR ↔ commit ได้ทันที (`Closes #12`)
- ฟิลด์ยืดหยุ่น Project เดียวดึงงานจากหลาย repo ได้
- ใช้กับ repo public ได้ฟรี และไม่ต้องจ่ายค่า license แยกต่อคนแบบ Jira

**ข้อที่ด้อยกว่า Jira (ควรรู้ก่อนย้าย)**
- ไม่มี burndown สำเร็จรูป มีแค่ burn up กับ chart ที่สร้างเอง (ข้อ 7)
- ไม่มีขั้นตอน start/complete sprint ต้องย้ายงานค้างเอง
- Story points เป็นแค่ฟิลด์ตัวเลข ไม่มีรายงาน velocity สำเร็จรูป
- Issue types มีเฉพาะ organization และบางฟีเจอร์ขึ้นกับแผนที่ใช้
- ย้ายข้อมูลเก่าจาก Jira ไม่มีเครื่องมือในตัว ต้องใช้สคริปต์หรือเครื่องมือภายนอก

**สิ่งที่ควรทดลองกับ org จริงของทีมก่อนตัดสินใจ**: historical chart, issue types และจำนวน auto-add workflow ที่แผนของทีมใช้ได้

---

แหล่งอ้างอิง
- [About insights for Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/about-insights-for-projects)
- [Configuring charts](https://docs.github.com/en/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/configuring-charts)
- [About iteration fields](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-iteration-fields)
- [About insights (Enterprise Server 3.11, ระบุข้อจำกัดตามแผน)](https://docs.github.com/en/enterprise-server@3.11/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/about-insights-for-projects)
