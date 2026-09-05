# ghs-fx-chain-builder
Grand Healing Studio FX Chain Builder - Logic Pro production companion app

Deploys on Railway as a single container: the root `Dockerfile` builds the
Next.js app and installs Python (librosa/basic-pitch/etc. from
`scripts/requirements.txt`) into the same image, which serves the audio
analysis and MIDI transcription API routes via subprocess. There is no
separate backend service.
