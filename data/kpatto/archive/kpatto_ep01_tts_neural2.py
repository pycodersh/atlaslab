# K-PATTO EP01 TTS 생성 스크립트
# Google Cloud TTS Neural2
# pip install google-cloud-texttospeech

import os
import time
import wave
import io
import struct
from google.cloud import texttospeech

client = texttospeech.TextToSpeechClient()

# 캐릭터 보이스 배정 (Neural2)
# Neural2 한국어: ko-KR-Neural2-A (여성), B (남성), C (여성), D (남성)
VOICES = {
    "emma":      "ko-KR-Neural2-A",   # 밝은 여성
    "staff":     "ko-KR-Neural2-C",   # 부드러운 여성
    "narration": "ko-KR-Neural2-A",   # 나레이션 (에마와 같되 속도 다름)
}

# Speaking rate 설정
RATES = {
    "emma":      1.0,
    "staff":     0.95,
    "narration": 0.9,   # 패턴 설명은 천천히
}

# EP01 대사 목록
DIALOGUES = [
    ("ep01-c1-b1", "emma",  "와, 예쁘다!"),
    ("ep01-c2-b1", "staff", "어서 오세요! 주문하시겠어요?"),
    ("ep01-c2-b2", "emma",  "저기요... 이거 뭐예요?"),
    ("ep01-c3-b1", "emma",  "달고나 라떼... 뭐예요?"),
    ("ep01-c3-b2", "staff", "달달하고 맛있어요!"),
    ("ep01-c4-b1", "emma",  "달고나 라떼 주세요!"),
    ("ep01-c4-b2", "staff", "사이즈는요?"),
    ("ep01-c4-b3", "emma",  "큰 거 주세요. 와이파이 있어요?"),
    ("ep01-c4-b4", "staff", "네, 있어요! 오천오백 원이에요."),
    ("ep01-c5-b1", "emma",  "너무 맛있어요!"),
    ("ep01-c5-b2", "staff", "감사합니다. 또 오세요."),
]

# EP01 패턴카드 (패턴 + 예문 순서대로)
PATTERNS = [
    ("ep01-p001", [
        "이에요, 예요.",
        "이게 김치예요.",
        "저는 학생이에요.",
        "달고나 라떼예요.",
    ]),
    ("ep01-p002", [
        "주세요.",
        "물 주세요.",
        "메뉴 주세요.",
        "카페라떼 주세요.",
    ]),
    ("ep01-p003", [
        "뭐예요?",
        "이거 뭐예요?",
        "저거 뭐예요?",
        "이름이 뭐예요?",
    ]),
    ("ep01-p004", [
        "있어요. 없어요.",
        "와이파이 있어요?",
        "자리 있어요?",
        "자리 없어요.",
    ]),
    ("ep01-p005", [
        "얼마예요?",
        "이거 얼마예요?",
        "라떼 얼마예요?",
        "다 해서 얼마예요?",
    ]),
]

SAMPLE_RATE = 24000  # Neural2 기본 샘플레이트


def synthesize(text: str, voice_name: str, speaking_rate: float = 1.0) -> bytes:
    """텍스트 → PCM bytes"""
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR",
        name=voice_name,
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16,
        sample_rate_hertz=SAMPLE_RATE,
        speaking_rate=speaking_rate,
    )
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )
    # LINEAR16 응답에서 WAV 헤더 제거 → raw PCM
    # Google TTS LINEAR16은 WAV 형식으로 반환
    return response.audio_content  # WAV bytes 그대로 사용


def make_silence(duration_sec: float) -> bytes:
    """묵음 PCM bytes 생성"""
    num_samples = int(SAMPLE_RATE * duration_sec)
    # 16-bit silence = 0x0000
    return struct.pack(f"<{num_samples}h", *([0] * num_samples))


def wav_to_pcm(wav_bytes: bytes) -> bytes:
    """WAV bytes → raw PCM bytes (헤더 제거)"""
    with io.BytesIO(wav_bytes) as f:
        with wave.open(f, 'rb') as wf:
            return wf.readframes(wf.getnframes())


def pcm_to_wav(pcm_bytes: bytes) -> bytes:
    """raw PCM bytes → WAV bytes"""
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(pcm_bytes)
    return buf.getvalue()


def save_dialogue(filename: str, character: str, text: str):
    """대사 한 줄 → WAV 파일"""
    wav_bytes = synthesize(text, VOICES[character], RATES[character])
    output_dir = "public/kpatto/audio/ep01"
    os.makedirs(output_dir, exist_ok=True)
    with open(f"{output_dir}/{filename}.wav", "wb") as f:
        f.write(wav_bytes)
    print(f"✅ {filename}.wav")
    time.sleep(0.3)


def save_pattern(filename: str, sentences: list[str]):
    """패턴카드: 문장 목록 → 0.5초 묵음 삽입 후 합쳐서 WAV"""
    pcm_parts = []
    silence = make_silence(0.5)

    for i, sentence in enumerate(sentences):
        wav_bytes = synthesize(sentence, VOICES["narration"], RATES["narration"])
        pcm = wav_to_pcm(wav_bytes)
        pcm_parts.append(pcm)
        if i < len(sentences) - 1:
            pcm_parts.append(silence)
        time.sleep(0.3)

    combined_pcm = b"".join(pcm_parts)
    combined_wav = pcm_to_wav(combined_pcm)

    output_dir = "public/kpatto/audio/ep01"
    os.makedirs(output_dir, exist_ok=True)
    with open(f"{output_dir}/{filename}.wav", "wb") as f:
        f.write(combined_wav)
    print(f"✅ {filename}.wav (패턴 {len(sentences)}문장 합본)")


# 실행
print("=== EP01 대사 생성 ===")
for filename, character, text in DIALOGUES:
    save_dialogue(filename, character, text)

print("\n=== EP01 패턴카드 생성 ===")
for filename, sentences in PATTERNS:
    save_pattern(filename, sentences)

print(f"\n🎉 완료! 총 {len(DIALOGUES) + len(PATTERNS)}개 파일")
print("저장 위치: public/kpatto/audio/ep01/")
