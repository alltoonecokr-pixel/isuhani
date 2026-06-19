const DOCTORS = [
  {
    name: "문학진",
    role: "대표원장",
    bio: "이수한의원 대표원장. 환자 한 분 한 분의 체질과 생활 습관을 살피는 정성 진료를 원칙으로 합니다.",
    specialties: ["추나요법", "체형 · 척추교정", "디스크 치료", "공진단"],
    initial: "文",
  },
  {
    name: "나효석",
    role: "원장 · 한방부인과",
    bio: "한방부인과 진료. 산후조리부터 갱년기, 난임, 자궁질환까지 여성의 일생 건강을 함께 살핍니다.",
    specialties: ["산후조리", "갱년기", "난임 · 임신", "자궁질환"],
    initial: "羅",
  },
  {
    name: "이윤호",
    role: "원장",
    bio: "체형·관절 통증 진료와 어린이 성장클리닉, 건강관리 전반을 담당합니다.",
    specialties: ["관절통증", "어린이 성장", "한방 다이어트", "건강관리"],
    initial: "李",
  },
];

export function Doctors() {
  return (
    <section id="doctors" className="bg-ink-50 border-t border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 py-16 md:py-24">
        <header className="grid lg:grid-cols-12 gap-6 lg:gap-12 pb-8 md:pb-12 border-b border-ink-200">
          <div className="lg:col-span-5">
            <div className="eyebrow">Section · 의료진</div>
            <h2 className="mt-3 font-serif text-3xl md:text-[44px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
              원장 3인이 함께 진료합니다
            </h2>
          </div>
          <p className="lg:col-span-6 lg:col-start-7 text-base md:text-lg text-ink-700 leading-[1.78] self-end">
            한 분의 환자에게 충분한 시간을 들이는 것이 이수한의원의 원칙입니다.
            세 명의 원장이 각자의 전문 분야로 환자분을 책임집니다.
          </p>
        </header>

        <div className="grid lg:grid-cols-3">
          {DOCTORS.map((doc, idx) => (
            <article
              key={doc.name}
              className={[
                "group bg-white py-10 md:py-12 px-6 md:px-9 border-b border-ink-200 transition-colors duration-300 hover:bg-herb-50",
                idx > 0 ? "lg:border-l lg:border-ink-200" : "",
                "lg:border-b-0",
              ].join(" ")}
            >
              <div className="flex items-start gap-5">
                <div className="w-[88px] h-[88px] shrink-0 border border-ink-300 flex items-center justify-center bg-white group-hover:border-ink-900 transition-colors">
                  <span className="font-serif text-[44px] font-black text-ink-900">
                    {doc.initial}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="chip">{doc.role}</div>
                  <div className="mt-2 font-serif text-2xl font-black tracking-[-0.025em] text-ink-900">
                    {doc.name}
                  </div>
                </div>
              </div>

              <p className="mt-7 text-[15px] text-ink-700 leading-[1.78]">
                {doc.bio}
              </p>

              <div className="mt-7 pt-5 border-t border-ink-200">
                <div className="text-[12px] tracking-[0.2em] uppercase text-ink-500 font-semibold mb-3">
                  진료 분야
                </div>
                <ul className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-sm text-ink-900">
                  {doc.specialties.map((s) => (
                    <li key={s} className="flex items-baseline gap-2">
                      <span className="text-herb-700">·</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
