# ฝึกใช้ GitHub Projects แทน Jira

คู่มือแบบภาพ 27 ขั้น ภาพถ่ายจากหน้าจอ GitHub จริงของ Project [เงินไปไหน – Dev](https://github.com/users/pthanathon/projects/22) เมื่อ 28 ต.ค. 2569 เลขในวงกลมแดงในภาพตรงกับเลขในคำอธิบายใต้ภาพ

> ฉบับ HTML อ่านง่ายกว่า: เปิด `docs/github-projects-practice.html` ในเบราว์เซอร์

## เทียบคำศัพท์ Jira → GitHub

| Jira | GitHub | หมายเหตุ |
|---|---|---|
| Project / Board | **Project** | Project เดียวดึง issue จากหลาย repo ได้ |
| Epic | **Parent issue + sub-issues** | issue แม่แสดงความคืบหน้าของ sub-issue ให้เอง |
| Story / Task / Bug | **Issue** + **label** + template | Issue types ของจริงมีเฉพาะ repo ใน organization |
| Story points | ฟิลด์ **Story point** (Number) | template ตั้งชื่อว่า Estimate เปลี่ยนชื่อได้ แต่ต้องเป็น Number ถึงจะรวมแต้มได้ |
| Sprint | ฟิลด์ **Iteration** | template ตั้งไว้ sprint ละ 2 สัปดาห์ |
| Backlog | view ตารางที่กรอง `no:iteration` |  |
| Sprint board | view **Board** กรอง `iteration:@current` |  |
| Fix version | **Milestone** |  |
| Component | **Label** |  |
| Burndown | Insights → **Burn up** | ไม่มี burndown ในตัว ใช้ burn up แทน (ขั้นที่ 25–27) |

## 1. เตรียม repo

ทำครั้งเดียว ก่อนเริ่มสร้าง issue

### ขั้นที่ 1: เปิดหน้า Labels ของ repo

[เปิดหน้านี้](https://github.com/pthanathon/NgenPaiNai/labels)

![ขั้นที่ 1](images/steps/step-01.png)

1. กด **New label** เพื่อสร้าง label ใหม่ ตอนนี้ยังไม่มี `story`, `task` และ `epic` (มีแค่ `bug`)

### ขั้นที่ 2: สร้าง label story, task และ epic

![ขั้นที่ 2](images/steps/step-02.png)

1. พิมพ์ชื่อ label เช่น `story`
2. กด **Create label** แล้วทำซ้ำอีกครั้งสำหรับ `task` และ `epic`

> issue template ของ repo นี้ติด label ให้อัตโนมัติ แต่จะติดได้ก็ต่อเมื่อ label นั้นมีอยู่แล้ว

## 2. สร้าง issue template

template ทำให้ทุกคนกรอก issue ในรูปแบบเดียวกัน มี 2 วิธี: <b>ผ่านหน้าเว็บ</b> ง่ายแต่ได้แค่ข้อความตั้งต้น หรือ <b>เขียนไฟล์ YAML</b> ได้ฟอร์มที่มีช่องบังคับกรอกและ dropdown (repo นี้ใช้วิธีที่ 2)

### ขั้นที่ 3: วิธีที่ 1 (หน้าเว็บ): เปิด Settings ของ repo

[เปิดหน้านี้](https://github.com/pthanathon/NgenPaiNai/settings)

![ขั้นที่ 3](images/steps/step-03.png)

1. เลื่อนลงไปที่หัวข้อ **Issues** แล้วกด **Set up templates**

### ขั้นที่ 4: วิธีที่ 1: เลือกแบบ template

![ขั้นที่ 4](images/steps/step-04.png)

1. กด **Add template: select**
2. เลือก **Bug report** หรือ **Feature request** ที่ GitHub เตรียมไว้ หรือ **Custom template** เพื่อเขียนเอง
3. แก้เสร็จแล้วกด **Propose changes** GitHub จะ commit ไฟล์ `.md` ลงโฟลเดอร์ `.github/ISSUE_TEMPLATE/` ให้

### ขั้นที่ 5: วิธีที่ 1: แก้เนื้อหา template

![ขั้นที่ 5](images/steps/step-05.png)

1. กดไอคอนดินสอเพื่อแก้ชื่อ คำอธิบาย และข้อความตั้งต้นในตัว issue
2. ตั้งค่าเพิ่มได้: ชื่อ issue ตั้งต้น ผู้รับผิดชอบ และ label ที่จะติดให้อัตโนมัติ

> วิธีนี้ได้แค่ข้อความตั้งต้นให้แก้ต่อ บังคับให้กรอกช่องไหนไม่ได้ ถ้าอยากได้ฟอร์มจริงให้ใช้วิธีที่ 2

### ขั้นที่ 6: วิธีที่ 2 (ไฟล์ YAML): โฟลเดอร์ template

[เปิดหน้านี้](https://github.com/pthanathon/NgenPaiNai/tree/main/.github/ISSUE_TEMPLATE)

![ขั้นที่ 6](images/steps/step-06.png)

1. template ต้องอยู่ในโฟลเดอร์ `.github/ISSUE_TEMPLATE/` ของ repo
2. ไฟล์ `.yml` หนึ่งไฟล์คือ template หนึ่งแบบ ส่วน `config.yml` ใช้ตั้งค่าหน้าเลือก template เช่น อนุญาตให้สร้าง issue เปล่าได้ไหม
3. สร้างไฟล์ใหม่บนเว็บได้ที่ **Add file** → **Create new file** ตั้งชื่อลงท้าย `.yml` หรือสร้างในเครื่องแล้ว push ก็ได้

### ขั้นที่ 7: วิธีที่ 2: GitHub ตรวจว่าไฟล์ถูกต้อง

![ขั้นที่ 7](images/steps/step-07.png)

1. ถ้าเขียนถูก จะขึ้นว่า "This file is used as an Issue Form template" ถ้าผิดจะบอกบรรทัดที่ผิดตรงนี้
2. **Preview** ดูหน้าตาฟอร์ม ส่วน **Code** ดูโค้ด YAML (ขั้นถัดไป)

### ขั้นที่ 8: วิธีที่ 2: โครงสร้างไฟล์ YAML

![ขั้นที่ 8](images/steps/step-08.png)

1. ส่วนหัว: `name` ชื่อในหน้าเลือก template, `description`, `title` ชื่อ issue ตั้งต้น และ `labels` ที่จะติดให้อัตโนมัติ
2. `projects`: ใส่ `["pthanathon/22"]` แล้ว issue ใหม่จะเข้า Project เอง (repo นี้ปิดไว้ เพราะ workflow Auto-add ทำให้อยู่แล้ว)
3. `body`: รายการช่องในฟอร์ม แต่ละช่องมี `type` (textarea, input, dropdown, checkboxes, markdown) และ `required: true` บังคับให้กรอก

```yaml
name: User story
description: ฟีเจอร์จากมุมมองผู้ใช้
title: "[Story] "
labels: ["story"]
body:
  - type: textarea
    id: story
    attributes:
      label: User story
      placeholder: ในฐานะ… ฉันอยาก… เพื่อ…
    validations:
      required: true
  - type: dropdown
    id: points
    attributes:
      label: Story points
      options: ["1", "2", "3", "5", "8", "13"]
```

> ดูตัวอย่างเต็มได้ในไฟล์ `.github/ISSUE_TEMPLATE/user_story.yml` ของ repo นี้ ส่วนช่องทั้งหมดที่ใช้ได้ดูที่ GitHub Docs หัวข้อ "Syntax for issue forms"

## 3. สร้าง issue จาก template

เทียบได้กับปุ่ม Create ใน Jira ตัวอย่างในขั้นนี้คือ Epic C ของจริงใน repo (#5–#8)

### ขั้นที่ 9: เลือก template ของ issue

[เปิดหน้านี้](https://github.com/pthanathon/NgenPaiNai/issues/new/choose)

![ขั้นที่ 9](images/steps/step-09.png)

1. เลือกตามชนิดงาน: **Bug**, **Epic**, **Task** หรือ **User story** (เทียบได้กับ issue type ใน Jira) ควรสร้าง Epic ก่อน แล้วค่อยสร้าง story ที่อยู่ใน epic นั้น

### ขั้นที่ 10: กรอก User story

![ขั้นที่ 10](images/steps/step-10.png)

1. ตั้งชื่อต่อท้าย `[Story]` แล้วกรอก user story กับ acceptance criteria ด้านล่าง acceptance criteria ต้องเป็นข้อที่ตอบได้ว่าผ่านหรือไม่ผ่าน ดูตัวอย่างใน #6
2. **Labels** ยังขึ้นว่า "No labels" เพราะยังไม่ได้ทำขั้นที่ 2 ถ้าสร้าง label แล้วจะติด `story` ให้เอง
3. **Projects** เลือก "เงินไปไหน – Dev" ตรงนี้ได้เลย (หรือปล่อยให้ workflow ในขั้นที่ 24 เพิ่มให้)
4. ติ๊ก **Create more** แล้วจะสร้าง issue ถัดไปต่อได้ทันที เหมาะตอนลง backlog ทีละหลายใบ

> ช่อง Story points ในฟอร์มเป็นแค่ข้อความในเนื้อ issue ค่าที่ใช้คำนวณจริงคือฟิลด์ **Story point** ใน Project ซึ่งต้องใส่เองอีกครั้ง

### ขั้นที่ 11: ผูก story เข้ากับ Epic (sub-issues)

[เปิดหน้านี้](https://github.com/pthanathon/NgenPaiNai/issues/5)

![ขั้นที่ 11](images/steps/step-11.png)

1. story ที่อยู่ใน epic นี้ (#6, #7, #8)
2. กดลูกศรข้าง **Create sub-issue** → **Add existing issue** เพื่อผูก story ที่สร้างไว้แล้ว หรือกด **Create sub-issue** เพื่อสร้างใหม่
3. ความคืบหน้าของ epic (ปิดไปแล้วกี่ใบจากทั้งหมด) อัปเดตเองเมื่อปิด story

> Epic ไม่ต้องใส่ Story point เพราะแต้มของ epic คือผลรวมของ story ลูก ถ้าใส่ซ้ำจะนับแต้มเกิน

## 4. ตั้งค่า Project

Project นี้สร้างจาก template "Team planning" ฟิลด์และ view ส่วนใหญ่จึงมีให้แล้ว

### ขั้นที่ 12: ส่วนต่างๆ ของ Project

[เปิดหน้านี้](https://github.com/users/pthanathon/projects/22)

![ขั้นที่ 12](images/steps/step-12.png)

1. **View** ที่ template สร้างให้: Backlog (ตาราง), Board, Current iteration, Roadmap และ My items
2. **Insights**: หน้ากราฟ (ขั้นที่ 25)
3. **Workflows**: ระบบอัตโนมัติ เปิดอยู่ 7 ตัว (ขั้นที่ 23)

### ขั้นที่ 13: ดูฟิลด์ที่มีอยู่ (เมนู ⋯ → Settings)

![ขั้นที่ 13](images/steps/step-13.png)

1. ฟิลด์ของ Project: **Story point** (ชนิด Number เปลี่ยนชื่อมาจาก Estimate ของ template) ใช้ใส่แต้ม, **Iteration** ใช้เป็น sprint, **Priority** ใช้จัดลำดับ backlog ส่วน **Size** เป็นขนาดแบบ S/M/L ใช้แทนแต้มได้ถ้าทีมไม่ใช้ story points
2. ปุ่ม **+** ตรงนี้ใช้สร้างฟิลด์ใหม่ได้เหมือนกัน และคลิกชื่อฟิลด์เพื่อเปลี่ยนชื่อหรือลบได้

### ขั้นที่ 14: อีกทางในการเพิ่มฟิลด์: ปุ่ม + ท้ายตาราง

![ขั้นที่ 14](images/steps/step-14.png)

1. ใน view ตาราง เลื่อนไปขวาสุด (Shift + ล้อเมาส์) แล้วกด **+**

### ขั้นที่ 15: เลือก New field

![ขั้นที่ 15](images/steps/step-15.png)

1. กด **New field** รายการด้านล่างใช้ซ่อนหรือแสดงคอลัมน์ในตาราง

### ขั้นที่ 16: ตั้งชื่อและชนิดฟิลด์

![ขั้นที่ 16](images/steps/step-16.png)

1. ชื่อฟิลด์
2. ชนิดฟิลด์ (ดูขั้นถัดไป)
3. กด **Save**

### ขั้นที่ 17: ชนิดฟิลด์ที่เลือกได้

![ขั้นที่ 17](images/steps/step-17.png)

1. **Number**: ใช้กับ story points เพราะรวมผลได้ทั้งใน Field sum และ Insights
2. **Single select**: ตัวเลือกเดียว เช่น Priority หรือ Status **ห้ามใช้กับ story points** เพราะ GitHub จะรวมแต้มให้ไม่ได้
3. **Iteration**: ใช้เป็น sprint

### ขั้นที่ 18: ตั้งค่า sprint (ฟิลด์ Iteration)

![ขั้นที่ 18](images/steps/step-18.png)

1. template สร้างไว้ 3 sprint ยาว **2 สัปดาห์** เริ่ม 27 ต.ค. sprint ที่กำลังทำอยู่มีป้าย **Current** เปลี่ยนชื่อเป็น Sprint 1, 2, 3 ได้ที่ช่องชื่อของแต่ละรอบ
2. **Add iteration** เพิ่ม sprint ถัดไป ส่วนเมนู More options ใช้เปลี่ยนความยาวหรือเพิ่มช่วงพักได้

## 5. ทำ backlog และแบ่ง sprint

ใช้ filter กับ view จัดงาน

### ขั้นที่ 19: กรองหา product backlog

![ขั้นที่ 19](images/steps/step-19.png)

1. พิมพ์ `no:iteration` จะเหลือเฉพาะงานที่ยังไม่อยู่ใน sprint ไหน นี่คือ **product backlog**
2. **Save** เก็บ filter ไว้กับ view นี้ ส่วน **Discard** ยกเลิก
3. ผลลัพธ์: Epic C กับ story ลูก 3 ใบ ซึ่งยังไม่ได้เลือกเข้า sprint

| filter | ได้อะไร |
|---|---|
| `no:iteration` | งานที่ยังไม่อยู่ใน sprint (product backlog) |
| `iteration:@current` | งานใน sprint ปัจจุบัน |
| `iteration:@next` | งานที่วางไว้ sprint หน้า |
| `-status:Done` | ซ่อนงานที่เสร็จแล้ว |
| `label:story` | เฉพาะ story |

### ขั้นที่ 20: ตั้งค่า view (ปุ่ม View)

![ขั้นที่ 20](images/steps/step-20.png)

1. เปลี่ยนรูปแบบ: Table / Board / Roadmap
2. **Group by**: จัดกลุ่ม เช่น ตาม Iteration เพื่อดูงานแยกตาม sprint ระหว่างวางแผน
3. **Field sum**: แสดงผลรวม Story point ใช้ดูว่าแต้มรวมเกินกำลังของ sprint หรือไม่
4. **Show hierarchy**: แสดง sub-issues ซ้อนใต้ epic (ดูข้อควรระวังในขั้นถัดไป)

### ขั้นที่ 21: ข้อควรระวัง: Show hierarchy กับผลรวมแต้ม

![ขั้นที่ 21](images/steps/step-21.png)

1. ภาพนี้ปิด Show hierarchy แล้ว ผลรวมเป็น **8 รายการ 27 แต้ม** ซึ่งถูกต้อง แต่ตอนเปิด Show hierarchy (ค่าตั้งต้น) จะขึ้นแค่ 5 รายการ 11 แต้ม เพราะ**ไม่นับ story ที่ซ้อนอยู่ใต้ epic**
2. story ลูกของ Epic C (#6–#8) รวม 16 แต้ม แสดงเป็นแถวปกติเมื่อปิด hierarchy

> ⚠️ ตอนวางแผน sprint ให้ใช้ view ที่**ปิด Show hierarchy** ไม่อย่างนั้นแต้มรวมจะต่ำกว่าความจริง ตรวจเมื่อ 28 ต.ค. 2569

### ขั้นที่ 22: Sprint board

[เปิดหน้านี้](https://github.com/users/pthanathon/projects/22/views/2)

![ขั้นที่ 22](images/steps/step-22.png)

1. แต่ละคอลัมน์คือ Status พร้อมจำนวนการ์ดและแต้ม Story point รวม ตัวเลขแบบ "0 / 5" คือจำนวนการ์ดเทียบกับขีดจำกัดของคอลัมน์ (WIP limit) ลากการ์ดข้ามคอลัมน์เพื่อเปลี่ยนสถานะ ถ้าใส่ filter `iteration:@current` จะเห็นเฉพาะงานใน sprint นี้

## 6. ตั้งระบบอัตโนมัติ

ให้การ์ดย้ายสถานะเองเมื่อปิด issue หรือ merge PR

### ขั้นที่ 23: Workflows ที่เปิดอยู่

[เปิดหน้านี้](https://github.com/users/pthanathon/projects/22/workflows)

![ขั้นที่ 23](images/steps/step-23.png)

1. จุดเขียว = เปิดอยู่ เช่น **Item closed** ย้ายการ์ดไป Done เอง และ **Pull request merged** ก็เช่นกัน ส่วน **Item added to project** ตั้ง issue ใหม่เป็น **Todo** ถ้าอยากให้เข้า Backlog ก่อน ให้แก้ที่ workflow นี้
2. **Auto-archive items** ปิดอยู่ ซึ่งถูกต้อง เพราะ Insights ไม่นับ item ที่ archive แล้ว กราฟจะหายถ้าเปิด

### ขั้นที่ 24: Auto-add: เพิ่ม issue ใหม่เข้า Project เอง

![ขั้นที่ 24](images/steps/step-24.png)

1. ตอนนี้ตั้งให้เพิ่ม issue ที่เปิดอยู่ของ repo NgenPaiNai ทุกใบ (`is:issue is:open`)
2. กด **Edit** ถ้าอยากเปลี่ยน filter เช่น เอาเฉพาะ `label:story,task,bug`

## 7. ดูรายงาน (burn up)

ใช้แทน burndown ของ Jira

### ขั้นที่ 25: กราฟ Burn up

[เปิดหน้านี้](https://github.com/users/pthanathon/projects/22/insights)

![ขั้นที่ 25](images/steps/step-25.png)

1. **Burn up** มีให้ในบัญชีส่วนตัวแบบฟรีด้วย (ตรวจเมื่อ 28 ต.ค. 2569)
2. เปลี่ยน filter เป็น `iteration:@current` เพื่อดูเฉพาะ sprint นี้
3. กด **Configure** เพื่อเปลี่ยนสิ่งที่นับ (ขั้นที่ 27)

### ขั้นที่ 26: อ่านกราฟ Burn up

![ขั้นที่ 26](images/steps/step-26.png)

1. เส้นเขียวคืองานที่ยังเปิดอยู่ (Open) ตอนนี้มี 8 ใบ เพิ่งสร้างเมื่อ 27–28 ต.ค. จึงพุ่งขึ้นตอนท้าย เมื่อปิด issue ได้ ส่วนที่เป็นงานเสร็จ (Completed) จะโตขึ้นและส่วน Open จะลดลง ส่วน Open ก็คือ "งานคงเหลือ" ที่ burndown แสดง

### ขั้นที่ 27: นับเป็นแต้มแทนจำนวน issue

![ขั้นที่ 27](images/steps/step-27.png)

1. ที่ Y-axis เลือก **Sum of a field** แล้วเลือก **Story point** กราฟจะเป็น burn up ตามแต้ม แล้วกด **Save to new chart**

> GitHub ไม่มี burndown แบบมีเส้นอุดมคติให้ในตัว ถ้าทีมต้องการจริงๆ ต้องใช้เครื่องมือเสริม หรือเขียน GitHub Action ดึงข้อมูลมาวาดเอง

## Story points: ใส่ 1 ค่าต่อ issue

ใส่ในฟิลด์ **Story point** เป็นตัวเลขบอกขนาดงานเมื่อเทียบกับงานอื่น ไม่ใช่จำนวนชั่วโมง ชุด 1, 2, 3, 5, 8, 13 (Fibonacci แบบดัดแปลง) ห่างกันขึ้นเรื่อยๆ เพราะงานยิ่งใหญ่ยิ่งประเมินไม่แม่น

| แต้ม | ความหมาย | ตัวอย่างจาก backlog |
|---|---|---|
| 1 | งานเล็กมาก รู้ชัดว่าต้องทำอะไร | B1 เปิด GitHub Pages |
| 2 | งานเล็ก | B2 เพิ่ม manifest กับไอคอน |
| 3 | งานกลาง ตรงไปตรงมา | A1 ตั้งเป้าเก็บเงินในเมนู |
| 5 | งานกลาง มีหลายส่วน | A2 แสดงความคืบหน้าเป้าในหน้าแรก |
| 8 | งานใหญ่ หรือยังมีจุดที่ไม่แน่ใจ | C3 เพิ่มหรือแก้หมวดเองได้ |
| 13 | ใหญ่เกินไป ควรแตกเป็นหลาย story ก่อน | – |

- ชุดตัวเลขนี้เป็น**ธรรมเนียมที่นิยม ไม่ใช่มาตรฐานสากล** Scrum Guide ไม่ได้บังคับ และ Jira ก็ให้ใส่เลขอะไรก็ได้ ทีมเลือกชุดเองได้ เช่น 1, 2, 4, 8 หรือ S/M/L (ฟิลด์ Size)
- แต้มเทียบกันข้ามทีมไม่ได้ "5 แต้ม" ของแต่ละทีมไม่เท่ากัน
- ต้องเป็นฟิลด์ชนิด **Number** ถ้าใช้ Single select จะได้ช่องเลือกที่สะดวกกว่า แต่ Field sum และกราฟจะรวมแต้มไม่ได้

## Epic กับ Sprint ต่างกันอย่างไร

**Epic** คือกลุ่มงานตามเรื่อง ส่วน **Sprint** คือช่วงเวลา ตัวอักษร A, B, C ไม่ได้แปลว่าต้องทำตามลำดับ ใน sprint เดียวมี story จากหลาย epic ปนกันได้ และ epic หนึ่งใช้หลาย sprint ได้ การเลือก story เข้า sprint เรียงตาม **Priority** ไม่ได้เรียงตาม epic

| | Sprint 1 | Sprint 2 | Sprint 3 |
|---|---|---|---|
| **Epic A** เป้าเก็บเงิน | A1 | A2 | A3 |
| **Epic B** ใช้บนมือถือ | B1, B4, B2 |  | B3 |
| **Epic C** จดเร็วขึ้น |  | C1 | C2, C3 |
| **Epic D** คุณภาพโค้ด | D1 | D2 |  |

## Product backlog ตัวอย่างของเงินไปไหน

**Epic A: เป้าเก็บเงิน**

| # | ชนิด | ชื่อ | Story point | Priority |
|---|---|---|---|---|
| A1 | Story | ตั้งเป้าเก็บเงินต่อเดือนในเมนู ⋯ (#1) | 3 | P1 |
| A2 | Story | แสดงความคืบหน้าเป้าเก็บเงินในหน้าแรก (#2) | 5 | P1 |
| A3 | Story | สรุปท้ายเดือนว่าเก็บได้ตามเป้าไหม (#3) | 2 | P2 |

**Epic B: ใช้บนมือถือเหมือนแอปจริง**

| # | ชนิด | ชื่อ | Story point | Priority |
|---|---|---|---|---|
| B1 | Task | เปิด GitHub Pages ให้แอปมีลิงก์เข้าใช้จากมือถือ (#4) | 1 | P0 |
| B2 | Story | เพิ่ม web app manifest และไอคอน | 2 | P1 |
| B3 | Story | ใช้งานออฟไลน์ด้วย service worker | 5 | P2 |
| B4 | Bug | ตรวจว่าคีย์บอร์ดมือถือบังปุ่ม "บันทึก" หรือไม่ | 2 | P0 |

**Epic C: จดเร็วขึ้น (#5)**

| # | ชนิด | ชื่อ | Story point | Priority |
|---|---|---|---|---|
| C1 | Story | ปุ่มรายการที่จดบ่อย แตะครั้งเดียวจดได้ (#6) | 5 | P1 |
| C2 | Story | ค้นหารายการจากบันทึกช่วยจำ (#7) | 3 | P2 |
| C3 | Story | เพิ่มหรือแก้ชื่อหมวดเองได้ (#8) | 8 | P2 |

**Epic D: คุณภาพโค้ด**

| # | ชนิด | ชื่อ | Story point | Priority |
|---|---|---|---|---|
| D1 | Task | unit test ให้ parseAmount และการคำนวณงบ | 3 | P1 |
| D2 | Task | GitHub Actions รันเทสต์ทุกครั้งที่ push | 2 | P2 |

รวม 12 งาน 41 แต้ม ตัวอย่าง sprint แรก (2 สัปดาห์): B1 + B4 + A1 + B2 + D1 = 11 แต้ม

## สรุปสำหรับเล่าให้พี่เลี้ยงฟัง

**ข้อดี**
- อยู่ที่เดียวกับโค้ด ปิด issue ได้จาก PR (`Closes #12`) และการ์ดย้ายไป Done เอง
- ฟิลด์และ view ปรับได้ยืดหยุ่น Project เดียวดึงงานจากหลาย repo ได้
- บัญชีส่วนตัวแบบฟรีก็ใช้ Burn up ได้ และนับเป็นแต้มได้ (ตรวจแล้ว 28 ต.ค. 2569)

**ข้อที่ด้อยกว่า Jira**
- ไม่มี burndown แบบมีเส้นอุดมคติในตัว
- ไม่มีปุ่ม start/complete sprint งานค้างต้องย้ายเอง
- ไม่มีรายงาน velocity สำเร็จรูป ต้องสร้างกราฟเอง
- Issue types มีเฉพาะ organization
- ไม่มีเครื่องมือย้ายข้อมูลจาก Jira ในตัว
- Story points ต้องเลือกระหว่างช่องเลือกที่สะดวก (Single select) กับการรวมแต้มได้ (Number) ได้อย่างเดียว
- ถ้าเปิด Show hierarchy ผลรวมแต้มใน view จะไม่นับ sub-issues ทำให้แต้มรวมต่ำกว่าความจริง
