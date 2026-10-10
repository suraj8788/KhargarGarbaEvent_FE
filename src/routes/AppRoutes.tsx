import { Navigate, Route, Routes } from 'react-router'
import { ROUTES } from '../constants/routes'
import AppLayout from '../layouts/AppLayout'
import EntryConfirmation from '../pages/Entry/EntryConfirmation'
import QRPage from '../pages/QR/QRPage'
import Registration from '../pages/Registration/Registration'
import QRScanner from '../pages/Scanner/QRScanner'
import SignIn from '../pages/SignIn/SignIn'
import SpinWheel from '../pages/SpinWheel/SpinWheel'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.registration} element={<Registration />} />
        <Route path={ROUTES.signIn} element={<SignIn />} />
        <Route path={ROUTES.entry} element={<EntryConfirmation />} />
        <Route path={ROUTES.qrPattern} element={<QRPage />} />
        <Route path={ROUTES.scanner} element={<QRScanner />} />
        <Route path={ROUTES.spin} element={<SpinWheel />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.registration} replace />} />
    </Routes>
  )
}
