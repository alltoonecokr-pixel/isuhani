import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Doctors } from "@/components/sections/Doctors";
import { Hours } from "@/components/sections/Hours";
import { Location } from "@/components/sections/Location";

export const metadata: Metadata = {
  title: "이수한의원 안내 — 진료·의료진·진료시간·오시는 길",
  description:
    "원장 3인의 디테일한 진료, 야간·주말 진료. 추나요법, 디스크치료, 체형교정, 산후조리, 어린이 성장클리닉, 공진단.",
};

export default function ClinicPage() {
  return (
    <>
      <Hero />
      <Services />
      <Doctors />
      <Hours />
      <Location />
    </>
  );
}
